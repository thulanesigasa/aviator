import os
import sys
import unittest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import torch
from models.sequence_lstm import CrashLSTM

class TestAnalytics(unittest.TestCase):
    """
    Unit tests verifying PyTorch LSTM tensor flow, dimensions bounding,
    and sigmoid probability output bounds for Aviator sequence forecasting.
    """
    def test_model_dimensions(self):
        # Instantiate LSTM with 2 stacked layers and 64 hidden units
        lstm = CrashLSTM(input_dim=1, hidden_dim=64, num_layers=2, output_dim=1)
        
        # Create a mock batch: 1 sample, sequence length of 15, 1 feature
        dummy_input = torch.zeros((1, 15, 1), dtype=torch.float32)
        prob_tensor = lstm(dummy_input)
        
        # Verify output shape matches (batch_size, output_dim) -> (1, 1)
        self.assertEqual(prob_tensor.shape, (1, 1))
        
        # Verify output is bounded between 0.0 and 1.0 (Sigmoid limits)
        prob = float(prob_tensor.item())
        self.assertTrue(0.0 <= prob <= 1.0)

if __name__ == "__main__":
    unittest.main()
