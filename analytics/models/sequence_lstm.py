import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

class CrashSequenceLSTM:
    """
    Keras LSTM model designed to predict whether the next crash multiplier
    will cross a target threshold (e.g. >= 2.00x) based on a sequence of historical inputs.
    """
    def __init__(self, sequence_length: int = 10, features: int = 1):
        self.sequence_length = sequence_length
        self.features = features
        self.model = self.build_model()

    def build_model(self) -> Sequential:
        model = Sequential([
            LSTM(64, input_shape=(self.sequence_length, self.features), return_sequences=True),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(16, activation='relu'),
            # Output node representing binary probability (>= 2.00x)
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        return model

    def train(self, x_train: np.ndarray, y_train: np.ndarray, epochs: int = 10, batch_size: int = 32):
        """
        Trains the model using sequence matrices.
        """
        # Reshape to (samples, sequence_length, features)
        if len(x_train.shape) == 2:
            x_train = np.expand_dims(x_train, axis=-1)
            
        return self.model.fit(
            x_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            verbose=1
        )

    def predict_probability(self, sequence: np.ndarray) -> float:
        """
        Predicts target probability from a single history array of size sequence_length.
        """
        if len(sequence.shape) == 1:
            sequence = np.expand_dims(sequence, axis=0)
        if len(sequence.shape) == 2:
            sequence = np.expand_dims(sequence, axis=-1)
            
        pred = self.model.predict(sequence, verbose=0)
        return float(pred[0][0])

    def save_weights(self, path: str):
        self.model.save_weights(path)

    def load_weights(self, path: str):
        self.model.load_state_dict(path)
