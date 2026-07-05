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

    def calculate_strategy_confidence(self, target: float, multipliers: list, lstm_prob: float) -> float:
        """
        Computes composite confidence percentage for any target exit multiplier.
        Combines physics baseline (0.97 / target), empirical success rate (last 50 flights),
        and the LSTM neural probability trend multiplier.
        """
        if target <= 1.0:
            return 0.0
            
        # 1. Game math baseline
        theoretical_prob = 0.97 / target
        
        # 2. Empirical success rate in recent flights
        recent = multipliers[-50:] if len(multipliers) >= 50 else multipliers
        successful_rounds = sum(1 for x in recent if x >= target)
        empirical_prob = successful_rounds / len(recent) if recent else theoretical_prob
        
        # Blend theoretical model with active session history
        base_prob = 0.4 * theoretical_prob + 0.6 * empirical_prob
        
        # 3. LSTM trend boost (comparing predictions to standard 1.50x baseline probability: 0.647)
        baseline_lstm = 0.647
        trend_factor = lstm_prob / baseline_lstm
        
        # Calculate dynamic confidence and bound to [0.01, 0.99]
        confidence = base_prob * trend_factor
        return max(0.01, min(confidence, 0.99))

    def generate_trading_signal(self, probability: float, multipliers: list) -> dict:
        """
        Maps probability scores and sequence patterns (e.g. streaks) to trading signals.
        Calculates exit targets dynamically using trend percentiles over the last 30 rounds,
        and dynamically computes confidence scores using a physics-empirical-LSTM blend.
        """
        last_few = multipliers[-5:]
        low_streak = sum(1 for x in last_few[-3:] if x < 1.30)
        
        # Fetch the last 30 rounds for dynamic trend percentiles
        recent_rounds = multipliers[-30:] if len(multipliers) >= 30 else multipliers
        
        # Calculate dynamic percentile targets representing distinct risk bounds
        raw_cons = float(np.percentile(recent_rounds, 25))
        raw_bal = float(np.percentile(recent_rounds, 50))
        raw_agg = float(np.percentile(recent_rounds, 75))
        
        # Bound targets to ensure realistic thresholds
        cons_target = max(1.10, min(raw_cons, 1.35))
        bal_target = max(1.25, min(raw_bal, 2.20))
        agg_target = max(1.50, min(raw_agg, 10.0))
        
        if low_streak >= 2:
            prediction = "WAIT: Cold Streak Recovery"
            target_mult = 1.00
            cons_target = 1.00
            bal_target = 1.00
            agg_target = 1.00
        elif probability >= 0.70:
            prediction = f"HIGH PROBABILITY: Enter at {bal_target:.2f}x"
            target_mult = bal_target
        elif probability >= 0.50:
            prediction = f"MEDIUM PROBABILITY: Enter at {bal_target:.2f}x"
            target_mult = bal_target
        else:
            prediction = "WAIT: Downward Trend"
            target_mult = 1.00
            cons_target = 1.00
            bal_target = 1.00
            agg_target = 1.00

        # Calculate dynamic composite confidence scores
        cons_conf = self.calculate_strategy_confidence(cons_target, multipliers, probability)
        bal_conf = self.calculate_strategy_confidence(bal_target, multipliers, probability)
        agg_conf = self.calculate_strategy_confidence(agg_target, multipliers, probability)

        strategies = {
            "conservative": {
                "name": "Conservative",
                "target": round(cons_target, 2),
                "confidence": round(cons_conf * 100, 1)
            },
            "balanced": {
                "name": "Balanced (LSTM)",
                "target": round(bal_target, 2),
                "confidence": round(bal_conf * 100, 1)
            },
            "aggressive": {
                "name": "Aggressive",
                "target": round(agg_target, 2),
                "confidence": round(agg_conf * 100, 1)
            }
        }

        return {
            "prediction": prediction,
            "probability": round(probability, 4),
            "threshold": round(target_mult, 2),
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
                            signal = self.generate_trading_signal(probability, multipliers)
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
