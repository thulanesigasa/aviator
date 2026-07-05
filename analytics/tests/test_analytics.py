import os
import sys
import unittest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import numpy as np
from models.sequence_lstm import CrashSequenceLSTM

class TestAnalytics(unittest.TestCase):
    def test_model_dimensions(self):
        lstm = CrashSequenceLSTM(sequence_length=10)
        # Dummy sequence input: batch of size 1, sequence length of 10, 1 feature
        dummy_input = np.zeros((1, 10, 1), dtype=np.float32)
        prob = lstm.model.predict(dummy_input, verbose=0)
        
        # Test output matches binary probability shape (1 sample, 1 node)
        self.assertEqual(prob.shape, (1, 1))
        # Sigmoid output must be bounded between 0 and 1
        self.assertTrue(0.0 <= float(prob[0][0]) <= 1.0)

    def test_lstm_predict_probability(self):
        lstm = CrashSequenceLSTM(sequence_length=10)
        sample_seq = np.zeros(10, dtype=np.float32)
        prob = lstm.predict_probability(sample_seq)
        self.assertTrue(isinstance(prob, float))
        self.assertTrue(0.0 <= prob <= 1.0)

if __name__ == "__main__":
    unittest.main()
