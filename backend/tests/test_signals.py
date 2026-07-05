import os
import sys
import unittest
# Add parent directory of tests to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import SignalGenerator

class TestSignalGenerator(unittest.TestCase):
    def test_five_low_multipliers_trigger(self):
        # 5 consecutive multipliers under 2.00x
        sequence = [1.50, 1.02, 1.88, 1.20, 1.45, 3.40, 1.10]
        signal = SignalGenerator.analyze_sequence(sequence)
        
        self.assertIsNotNone(signal)
        self.assertEqual(signal["trigger_type"], "5_Lows_Out")
        self.assertEqual(signal["recommended_cashout"], 1.50)
        self.assertEqual(signal["win_probability"], 0.815)

    def test_non_triggering_sequence(self):
        # Contains a value >= 2.00 in the latest 5 entries
        sequence = [1.50, 2.05, 1.88, 1.20, 1.45, 1.10]
        signal = SignalGenerator.analyze_sequence(sequence)
        self.assertIsNone(signal)

    def test_short_sequence(self):
        # Sequence too short
        sequence = [1.20, 1.10, 1.05]
        signal = SignalGenerator.analyze_sequence(sequence)
        self.assertIsNone(signal)

if __name__ == "__main__":
    unittest.main()
