import os
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client
from models.sequence_lstm import CrashSequenceLSTM

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class ModelTrainer:
    def __init__(self, seq_len: int = 10):
        self.seq_len = seq_len
        self.supabase: Optional[Client] = None
        self.setup_supabase()
        self.lstm = CrashSequenceLSTM(sequence_length=seq_len)

    def setup_supabase(self):
        if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
            try:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            except Exception as e:
                print(f"[Analytics] Supabase connection failed: {e}")

    def fetch_data(self) -> np.ndarray:
        """
        Pulls multipliers from Supabase or falls back to simulated data.
        """
        if self.supabase:
            try:
                response = self.supabase.table("multiplier_history") \
                    .select("multiplier") \
                    .order("timestamp", desc=True) \
                    .limit(1000) \
                    .execute()
                data = response.data
                if data and len(data) > 50:
                    print(f"[Analytics] Pulled {len(data)} records from database.")
                    return np.array([float(r["multiplier"]) for r in data])
            except Exception as e:
                print(f"[Analytics] Database fetch error: {e}")
        
        # Simulated Pareto distribution dataset fallback for offline training
        print("[Analytics] Generating simulated Pareto dataset (1,500 games) for local training...")
        u = np.random.uniform(0.0, 0.97, 1500)
        multipliers = 0.97 / (1.0 - u)
        return np.clip(multipliers, 1.00, 50.00)

    def prepare_sequences(self, data: np.ndarray):
        """
        Converts 1D list of multipliers into sequence blocks.
        Input: [1.2, 1.5, 2.4, 1.1, 1.8, 2.5]
        X: Sequence of size seq_len
        Y: 1 if next multiplier >= 2.0x else 0
        """
        x_data = []
        y_data = []
        
        for i in range(len(data) - self.seq_len):
            seq = data[i : i + self.seq_len]
            target = data[i + self.seq_len]
            
            # Normalize sequence inputs (e.g. log scaling to squeeze extreme values)
            seq_norm = np.log1p(seq)
            target_bin = 1 if target >= 2.00 else 0
            
            x_data.append(seq_norm)
            y_data.append(target_bin)
            
        return np.array(x_data, dtype=np.float32), np.array(y_data, dtype=np.float32)

    def run(self):
        # 1. Pull data
        raw_multipliers = self.fetch_data()
        
        # 2. Reformat to sequences
        x, y = self.prepare_sequences(raw_multipliers)
        print(f"[Analytics] Created sequence shapes: X={x.shape}, Y={y.shape}")
        
        # 3. Train LSTM
        print("[Analytics] Compiling and training Keras LSTM neural network...")
        self.lstm.train(x, y, epochs=5, batch_size=32)
        
        # 4. Save checkpoints
        os.makedirs("checkpoints", exist_ok=True)
        self.lstm.save_weights("checkpoints/lstm_aviator_weights.h5")
        print("[Analytics] Saved trained weights to checkpoints/lstm_aviator_weights.h5")

        # 5. Verify single inference prediction
        sample_seq = np.log1p(raw_multipliers[:self.seq_len])
        prob = self.lstm.predict_probability(sample_seq)
        print(f"[Analytics] Sample inference win probability for next round: {prob * 100:.2f}%")

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.run()
