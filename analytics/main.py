import os
import time
import asyncio
import datetime
import httpx
import torch
import numpy as np
from models.sequence_lstm import CrashLSTM

API_HISTORY_URL = os.getenv("API_HISTORY_URL", "http://localhost:8000/api/history?limit=1000")
API_SIGNAL_UPDATE_URL = os.getenv("API_SIGNAL_UPDATE_URL", "http://localhost:8000/api/signals/update")

class AnalyticsEngine:
    """
    Coordinates historical polling, PyTorch LSTM training/inference steps,
    multi-strategy mapping, and dispatching signal payloads back to the FastAPI gateway.
    """
    def __init__(self, sequence_length: int = 15):
        self.sequence_length = sequence_length
        self.model = CrashLSTM(input_dim=1, hidden_dim=64, num_layers=2, output_dim=1)
        self.model.eval()  # Default to evaluation mode
        
        # Load weights checkpoint if exists, otherwise start clean
        self.checkpoint_path = "checkpoints/lstm_aviator.pth"
        os.makedirs("checkpoints", exist_ok=True)
        if os.path.exists(self.checkpoint_path):
            try:
                self.model.load_state_dict(torch.load(self.checkpoint_path, map_location=torch.device('cpu')))
                print(f"[Analytics] Loaded model weights from {self.checkpoint_path}")
            except Exception as e:
                print(f"[Analytics] Error loading weights checkpoint: {e}. Starting clean.")
        else:
            print("[Analytics] Checkpoint not found. Running with initial weights.")

    def preprocess_sequence(self, multipliers: list) -> torch.Tensor:
        """
        Pads or truncates historical multipliers list, normalizes values,
        and formats into a FloatTensor batch shape: (1, seq_len, 1).
        """
        seq = list(multipliers)
        if len(seq) < self.sequence_length:
            seq = [1.0] * (self.sequence_length - len(seq)) + seq
        elif len(seq) > self.sequence_length:
            seq = seq[-self.sequence_length:]
            
        normalized = [np.log1p(x) for x in seq]
        tensor_seq = torch.FloatTensor(normalized).view(1, self.sequence_length, 1)
        return tensor_seq

    def retrain_on_history(self, records: list):
        """
        Builds chronological rolling sequences from the collected database history,
        runs mini-epoch gradient descents to fit the model to session trends,
        and updates the persistent weights checkpoint.
        """
        if len(records) < self.sequence_length + 2:
            return
            
        multipliers = [float(r.get("multiplier", 1.0)) for r in records]
        
        x_data = []
        y_data = []
        
        # Formulate all rolling train pairs from session logs
        for i in range(len(multipliers) - self.sequence_length):
            seq = multipliers[i : i + self.sequence_length]
            target = multipliers[i + self.sequence_length]
            
            normalized_seq = [np.log1p(val) for val in seq]
            x_data.append(normalized_seq)
            
            # Binary classification target: 1.0 if next flight exceeds safety bounds (>= 1.50x), else 0.0
            binary_target = 1.0 if target >= 1.50 else 0.0
            y_data.append([binary_target])
            
        # Convert to PyTorch Tensors
        x_tensor = torch.FloatTensor(x_data).view(-1, self.sequence_length, 1)
        y_tensor = torch.FloatTensor(y_data).view(-1, 1)
        
        # Mini-epoch optimizer routine
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.005)
        criterion = torch.nn.BCELoss()
        
        self.model.train()
        epochs = 8
        loss_val = 0.0
        
        for epoch in range(epochs):
            optimizer.zero_grad()
            predictions = self.model(x_tensor)
            loss = criterion(predictions, y_tensor)
            loss.backward()
            optimizer.step()
            loss_val = loss.item()
            
        self.model.eval()
        
        # Persist weights checkpoint
        try:
            torch.save(self.model.state_dict(), self.checkpoint_path)
            print(f"[Analytics] Retrained on session history ({len(x_data)} sequences). Loss: {loss_val:.5f}. Checkpoint persisted.")
        except Exception as e:
            print(f"[Analytics] Failed to save weights: {e}")

    def generate_trading_signal(self, probability: float, last_few: list) -> dict:
        """
        Maps probability scores and sequence patterns (e.g. streaks) to trading signals.
        Calculates three strategy layers: Conservative, Balanced, and Aggressive.
        """
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

        # Build dynamic multiple-strategy options
        cons_conf = min(probability * 1.3, 0.99) if low_streak < 2 else 0.10
        bal_conf = probability if low_streak < 2 else 0.05
        agg_conf = max(probability * 0.7, 0.01) if low_streak < 2 else 0.01

        strategies = {
            "conservative": {
                "name": "Conservative",
                "target": 1.15 if low_streak < 2 else 1.00,
                "confidence": round(cons_conf * 100, 1)
            },
            "balanced": {
                "name": "Balanced (LSTM)",
                "target": target_mult,
                "confidence": round(bal_conf * 100, 1)
            },
            "aggressive": {
                "name": "Aggressive",
                "target": 1.70 if low_streak < 2 else 1.00,
                "confidence": round(agg_conf * 100, 1)
            }
        }

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "threshold": target_mult,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "strategies": strategies
        }

    async def run_loop(self):
        print("[Analytics] LSTM Ingestion loop active. Listening for history updates...")
        last_processed_timestamp = None
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            while True:
                try:
                    response = await client.get(API_HISTORY_URL)
                    if response.status_code == 200:
                        records = response.json()
                        if not records:
                            await asyncio.sleep(3.0)
                            continue

                        latest_record = records[-1]
                        latest_timestamp = latest_record.get("timestamp")
                        
                        if latest_timestamp != last_processed_timestamp:
                            last_processed_timestamp = latest_timestamp
                            
                            # Retrain model on all historical database patterns
                            self.retrain_on_history(records)
                            
                            # Perform active prediction forward pass
                            multipliers = [float(r.get("multiplier", 1.0)) for r in records]
                            input_tensor = self.preprocess_sequence(multipliers)
                            
                            with torch.no_grad():
                                prob_tensor = self.model(input_tensor)
                                probability = float(prob_tensor.item())

                            # Map to signals and multiple strategies
                            signal = self.generate_trading_signal(probability, multipliers[-5:])
                            print(f"[Analytics] Signal Update: {signal['prediction']} (P={signal['probability']:.4f})")
                            
                            # Dispatch predictions back to the backend
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
                
                await asyncio.sleep(3.0)

if __name__ == "__main__":
    engine = AnalyticsEngine()
    try:
        asyncio.run(engine.run_loop())
    except KeyboardInterrupt:
        print("[Analytics] Stopped by user command.")
