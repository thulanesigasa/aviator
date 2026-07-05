import os
import time
import asyncio
import datetime
import httpx
import torch
import numpy as np
from models.sequence_lstm import CrashLSTM

API_HISTORY_URL = os.getenv("API_HISTORY_URL", "http://localhost:8000/api/history?limit=15")
API_SIGNAL_UPDATE_URL = os.getenv("API_SIGNAL_UPDATE_URL", "http://localhost:8000/api/signals/update")

class AnalyticsEngine:
    """
    Coordinates historical polling, PyTorch LSTM tensor formatting,
    inference computations, and signal dispatching back to the FastAPI gateway.
    """
    def __init__(self, sequence_length: int = 15):
        self.sequence_length = sequence_length
        self.model = CrashLSTM(input_dim=1, hidden_dim=64, num_layers=2, output_dim=1)
        self.model.eval()  # Set evaluation mode
        
        # Load weights checkpoint if exists, otherwise run with initial weights
        checkpoint_path = "checkpoints/lstm_aviator.pth"
        if os.path.exists(checkpoint_path):
            try:
                self.model.load_state_dict(torch.load(checkpoint_path, map_location=torch.device('cpu')))
                print(f"[Analytics] Loaded model weights from {checkpoint_path}")
            except Exception as e:
                print(f"[Analytics] Error loading weights checkpoint: {e}. Using initial weights.")
        else:
            print("[Analytics] Checkpoint not found. Running inference with initial model weights.")

    def preprocess_sequence(self, multipliers: list) -> torch.Tensor:
        """
        Pads or truncates historical multipliers list, normalizes values,
        and formats into a FloatTensor batch shape: (1, seq_len, 1).
        """
        seq = list(multipliers)
        # Pad with 1.0 if sequence is shorter than targeted length
        if len(seq) < self.sequence_length:
            seq = [1.0] * (self.sequence_length - len(seq)) + seq
        # Truncate if longer
        elif len(seq) > self.sequence_length:
            seq = seq[-self.sequence_length:]
            
        # Log-normalize values to prevent numerical instability from massive multipliers
        normalized = [np.log1p(x) for x in seq]
        tensor_seq = torch.FloatTensor(normalized).view(1, self.sequence_length, 1)
        return tensor_seq

    def generate_trading_signal(self, probability: float, last_few: list) -> dict:
        """
        Maps probability scores and sequence patterns (e.g. streaks) to trading signals.
        Supports a "short-term 5 wins" strategy targeting low, high-probability multiplier cashouts.
        """
        # Fallback check: if there's a streak of consecutive low crashes (e.g., < 1.2x), risk increases
        low_streak = sum(1 for x in last_few[-3:] if x < 1.30)
        
        if low_streak >= 2:
            prediction = "WAIT: Cold Streak Recovery"
            target_mult = 1.00
        elif probability >= 0.70:
            prediction = "HIGH PROBABILITY: Enter at 1.35x"
            target_mult = 1.35
        elif probability >= 0.50:
            prediction = "MEDIUM PROBABILITY: Enter at 1.20x"
            target_mult = 1.20
        else:
            prediction = "WAIT: Downward Trend"
            target_mult = 1.00

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "threshold": target_mult,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

    async def run_loop(self):
        print("[Analytics] LSTM Ingestion loop active. Listening for history updates...")
        last_processed_timestamp = None
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            while True:
                try:
                    # Query backend history endpoint
                    response = await client.get(API_HISTORY_URL)
                    if response.status_code == 200:
                        records = response.json()
                        if not records:
                            await asyncio.sleep(4.0)
                            continue

                        # Check if any new records are available by comparing last timestamp
                        latest_record = records[-1]
                        latest_timestamp = latest_record.get("timestamp")
                        
                        if latest_timestamp != last_processed_timestamp:
                            last_processed_timestamp = latest_timestamp
                            
                            # Extract multipliers list
                            multipliers = [float(r.get("multiplier", 1.0)) for r in records]
                            
                            # Run LSTM forward pass
                            input_tensor = self.preprocess_sequence(multipliers)
                            with torch.no_grad():
                                prob_tensor = self.model(input_tensor)
                                probability = float(prob_tensor.item())

                            # Map to signal
                            signal = self.generate_trading_signal(probability, multipliers[-5:])
                            print(f"[Analytics] Signal Update: {signal['prediction']} (P={signal['probability']:.4f})")
                            
                            # Post signal to FastAPI server
                            try:
                                update_resp = await client.post(API_SIGNAL_UPDATE_URL, json=signal)
                                if update_resp.status_code != 200:
                                    print(f"[Analytics] Failed to post signal: HTTP {update_resp.status_code}")
                            except Exception as e:
                                print(f"[Analytics] Ingestion POST error: {e}")
                    else:
                        print(f"[Analytics] Failed to fetch history: HTTP {response.status_code}")
                except Exception as e:
                    print(f"[Analytics] Predictor loop exception: {e}")
                
                # Check for new rounds every 3 seconds
                await asyncio.sleep(3.0)

if __name__ == "__main__":
    engine = AnalyticsEngine()
    try:
        asyncio.run(engine.run_loop())
    except KeyboardInterrupt:
        print("[Analytics] Stopped by user command.")
