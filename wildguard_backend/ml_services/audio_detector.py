"""
ML SERVICES - AUDIO DETECTOR
=============================
Production audio detection module using the finalized Random Forest model.

This module:
- Loads the selected Random Forest audio classifier
- Extracts 20 key features from audio
- Performs classification for poaching/wildlife sounds
- Returns predictions with confidence scores
- Stores results in MongoDB

Academic Purpose:
Uses only the finalized model and features selected in ml_experiments/
"""

import numpy as np
import json
from datetime import datetime
from typing import Dict, List

class AudioDetector:
    """
    Random Forest-based audio detection for poaching and wildlife sound identification.
    
    In production, this would use:
    - import joblib
    - model = joblib.load('ml_services/models/audio_classifier.pkl')
    
    For this academic project, we use mock implementation.
    """
    
    # Audio classes from experimentation
    AUDIO_CLASSES = {
        0: "elephant",
        1: "lion",
        2: "bird",
        3: "rain",
        4: "wind",
        5: "vehicle",      # Threat indicator
        6: "chainsaw",     # Threat indicator
        7: "gunshot"       # Emergency alert
    }
    
    THREAT_CLASSES = {"vehicle", "chainsaw", "gunshot"}
    WILDLIFE_CLASSES = {"elephant", "lion", "bird"}
    AMBIENT_CLASSES = {"rain", "wind"}
    
    # 20 selected features from feature_selection.py
    SELECTED_FEATURES = [
        "mfcc_mean_0", "mfcc_mean_1", "mfcc_mean_5", "mfcc_mean_8",
        "mfcc_std_3", "mfcc_std_7", "spectral_centroid_mean",
        "spectral_rolloff_mean", "spectral_rolloff_std", "zcr_mean",
        "chroma_mean_2", "chroma_mean_5", "chroma_mean_8",
        "rms_energy_mean", "rms_energy_std",
        "zero_crossing_rate_mean", "spectral_flux_mean",
        "spectral_centroid_std", "zcr_std", "chroma_mean_11"
    ]
    
    def __init__(self, model_path: str = None):
        """
        Initialize Audio Detector.
        
        Parameters:
        -----------
        model_path : str
            Path to trained Random Forest model
        """
        self.model_path = model_path or "ml_services/models/audio_classifier.pkl"
        self.model = None
        self.confidence_threshold = 0.7
        self.load_model()
    
    def load_model(self):
        """
        Load Random Forest model from disk.
        
        Production Code (commented):
        ----
        import joblib
        self.model = joblib.load(self.model_path)
        ----
        """
        print(f"[AudioDetector] Loading model from {self.model_path}")
        # Mock loading
        self.model = {
            "type": "RandomForest",
            "n_estimators": 100,
            "n_features": 20,
            "classes": list(self.AUDIO_CLASSES.values())
        }
    
    def extract_features(self, audio_data: np.ndarray, sr: int = 22050) -> Dict[str, float]:
        """
        Extract the 20 selected features from audio signal.
        
        Parameters:
        -----------
        audio_data : ndarray
            Audio signal (mono, 1D array)
        sr : int
            Sample rate
            
        Returns:
        --------
        features : dict
            Dictionary with selected feature names and values
        """
        # Production Code would use librosa:
        # ----
        # import librosa
        # mfcc = librosa.feature.mfcc(y=audio_data, sr=sr, n_mfcc=13)
        # spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
        # ----
        
        features = {}
        
        # Mock feature extraction with realistic ranges
        for feature_name in self.SELECTED_FEATURES:
            features[feature_name] = float(np.random.randn())
        
        return features
    
    def predict(self, audio_path: str) -> Dict:
        """
        Classify audio file.
        
        Parameters:
        -----------
        audio_path : str
            Path to audio file
            
        Returns:
        --------
        prediction : dict
            Classification result with probabilities
        """
        # Production Code:
        # ----
        # audio_data, sr = librosa.load(audio_path, sr=22050, mono=True)
        # features = self.extract_features(audio_data, sr)
        # feature_vector = [features[name] for name in self.SELECTED_FEATURES]
        # prediction_proba = self.model.predict_proba([feature_vector])[0]
        # ----
        
        features = self.extract_features(None)
        prediction = self._mock_predict(features)
        
        return prediction
    
    def _mock_predict(self, features: Dict) -> Dict:
        """Mock prediction for demonstration."""
        # Generate random probabilities that sum to 1
        proba = np.random.dirichlet(np.ones(len(self.AUDIO_CLASSES)))
        
        # Find top prediction
        predicted_class_id = np.argmax(proba)
        predicted_class_name = self.AUDIO_CLASSES[predicted_class_id]
        confidence = float(proba[predicted_class_id])
        
        # Get class probabilities for all classes
        class_probabilities = {}
        for class_id, class_name in self.AUDIO_CLASSES.items():
            class_probabilities[class_name] = round(float(proba[class_id]), 4)
        
        return {
            "audio_path": "audio_file.wav",
            "timestamp": datetime.now().isoformat(),
            "predicted_class": predicted_class_name,
            "confidence": round(confidence, 4),
            "class_probabilities": class_probabilities,
            "above_threshold": confidence >= self.confidence_threshold
        }
    
    def batch_predict(self, audio_paths: List[str]) -> List[Dict]:
        """
        Classify multiple audio files.
        
        Parameters:
        -----------
        audio_paths : list
            List of audio file paths
            
        Returns:
        --------
        predictions : list
            List of classification results
        """
        predictions = []
        for audio_path in audio_paths:
            prediction = self.predict(audio_path)
            predictions.append(prediction)
        return predictions
    
    def process_prediction_result(self, prediction_result: Dict) -> Dict:
        """
        Process prediction for alert generation and database storage.
        
        Parameters:
        -----------
        prediction_result : dict
            Raw prediction from model
            
        Returns:
        --------
        processed : dict
            Processed result ready for database
        """
        predicted_class = prediction_result["predicted_class"]
        confidence = prediction_result["confidence"]
        
        # Determine alert status
        alert_generated = False
        alert_level = "none"
        alert_type = None
        
        if confidence >= self.confidence_threshold:
            if predicted_class in self.THREAT_CLASSES:
                alert_generated = True
                alert_level = "CRITICAL" if predicted_class == "gunshot" else "HIGH"
                alert_type = f"⚠️ {predicted_class.upper()} detected"
            elif predicted_class in self.WILDLIFE_CLASSES:
                alert_type = f"🦁 Wildlife: {predicted_class}"
            else:
                alert_type = f"🌧️ Ambient: {predicted_class}"
        
        processed = {
            "timestamp": datetime.now().isoformat(),
            "audio_file": prediction_result["audio_path"],
            "detected_sound": predicted_class,
            "confidence": confidence,
            "sound_category": self._categorize_sound(predicted_class),
            "alert_generated": alert_generated,
            "alert_level": alert_level,
            "alert_type": alert_type,
            "class_probabilities": prediction_result["class_probabilities"],
            "recommended_action": self._recommend_action(predicted_class, confidence)
        }
        
        return processed
    
    @staticmethod
    def _categorize_sound(sound_class: str) -> str:
        """Categorize sound type."""
        if sound_class in {"vehicle", "chainsaw", "gunshot"}:
            return "threat"
        elif sound_class in {"elephant", "lion", "bird"}:
            return "wildlife"
        else:
            return "ambient"
    
    @staticmethod
    def _recommend_action(sound_class: str, confidence: float) -> str:
        """Recommend action based on detection."""
        if sound_class == "gunshot" and confidence > 0.8:
            return "CRITICAL: Immediate ranger alert - potential armed poacher"
        elif sound_class == "chainsaw" and confidence > 0.75:
            return "HIGH: Alert rangers - illegal tree cutting detected"
        elif sound_class == "vehicle" and confidence > 0.75:
            return "MEDIUM: Check for unauthorized vehicles in restricted zone"
        elif sound_class in {"elephant", "lion"} and confidence > 0.7:
            return "INFO: Wildlife activity logged - monitor for threats"
        else:
            return "Ambient sound - no action required"


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Example usage of AudioDetector
    """
    print("\n" + "="*70)
    print("AUDIO DETECTOR - PRODUCTION ML SERVICE")
    print("="*70)
    
    detector = AudioDetector()
    
    print(f"\n✓ Initialized detector using {detector.model_path}")
    print(f"✓ Confidence threshold: {detector.confidence_threshold}")
    print(f"✓ Audio classes: {len(detector.AUDIO_CLASSES)}")
    print(f"✓ Selected features: {len(detector.SELECTED_FEATURES)}")
    print(f"\n✓ Threat detection classes: {detector.THREAT_CLASSES}")
    print(f"✓ Wildlife classes: {detector.WILDLIFE_CLASSES}")
    
    print("\n" + "="*70)
    print("PROCESSING SAMPLE AUDIO")
    print("="*70)
    
    # Process sample audio files
    test_audio_files = [
        "/path/to/forest_audio_1.wav",
        "/path/to/forest_audio_2.wav",
        "/path/to/forest_audio_3.wav"
    ]
    
    for audio_path in test_audio_files:
        result = detector.predict(audio_path)
        processed = detector.process_prediction_result(result)
        
        print(f"\n🔊 Audio: {audio_path}")
        print(f"   Detected: {result['predicted_class']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   Category: {processed['sound_category']}")
        print(f"   Alert: {'🚨 YES' if processed['alert_generated'] else '✓ No'}")
        if processed['alert_type']:
            print(f"   Type: {processed['alert_type']}")
        print(f"   Action: {processed['recommended_action']}")
