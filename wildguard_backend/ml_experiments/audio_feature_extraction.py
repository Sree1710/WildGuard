"""
AUDIO FEATURE EXTRACTION
========================
This module extracts acoustic features from forest audio recordings
for wildlife and poaching activity detection.

Features Extracted:
1. MFCC (Mel-Frequency Cepstral Coefficients)
   - Represents power spectrum of sound on mel scale
   - Mimics human hearing perception
   
2. Spectral Centroid
   - Center of mass of the frequency spectrum
   - Indicates "brightness" of sound
   
3. Zero Crossing Rate (ZCR)
   - Number of times signal crosses zero per frame
   - Distinguishes voiced vs unvoiced speech
   
4. Chroma Features
   - Distribution of energy across 12 musical pitches
   - Useful for detecting rhythmic poaching activities

5. Temporal Features
   - RMS Energy (overall loudness)
   - Spectral Rolloff (frequency below which most energy is concentrated)

Academic Purpose:
Extracted features are used for model training in audio_model_comparison.py
"""

import numpy as np
import json
from datetime import datetime

# ============================================================================
# MOCK AUDIO FEATURE EXTRACTION (Real would use librosa)
# ============================================================================

class AudioFeatureExtractor:
    """
    Extract acoustic features from audio data.
    In production, this would use librosa library.
    """
    
    FEATURE_NAMES = [
        # MFCC Features (typically 13 coefficients)
        "mfcc_mean_0", "mfcc_mean_1", "mfcc_mean_2", "mfcc_mean_3", "mfcc_mean_4",
        "mfcc_mean_5", "mfcc_mean_6", "mfcc_mean_7", "mfcc_mean_8", "mfcc_mean_9",
        "mfcc_mean_10", "mfcc_mean_11", "mfcc_mean_12",
        
        # MFCC Standard Deviations
        "mfcc_std_0", "mfcc_std_1", "mfcc_std_2", "mfcc_std_3", "mfcc_std_4",
        "mfcc_std_5", "mfcc_std_6", "mfcc_std_7", "mfcc_std_8", "mfcc_std_9",
        "mfcc_std_10", "mfcc_std_11", "mfcc_std_12",
        
        # Spectral Features
        "spectral_centroid_mean", "spectral_centroid_std",
        "spectral_rolloff_mean", "spectral_rolloff_std",
        
        # Zero Crossing Rate
        "zcr_mean", "zcr_std",
        
        # Chroma Features
        "chroma_mean_0", "chroma_mean_1", "chroma_mean_2", "chroma_mean_3",
        "chroma_mean_4", "chroma_mean_5", "chroma_mean_6", "chroma_mean_7",
        "chroma_mean_8", "chroma_mean_9", "chroma_mean_10", "chroma_mean_11",
        
        # Energy Features
        "rms_energy_mean", "rms_energy_std",
        
        # Temporal Features
        "zero_crossing_rate_mean", "spectral_flux_mean"
    ]
    
    def __init__(self):
        self.num_features = len(self.FEATURE_NAMES)
        self.feature_names = self.FEATURE_NAMES
        
    def extract_features(self, audio_data, sr=22050):
        """
        Extract all acoustic features from audio signal.
        
        Parameters:
        -----------
        audio_data : array-like
            Audio signal (mono, 1D array)
        sr : int
            Sample rate (default: 22050 Hz)
            
        Returns:
        --------
        features : dict
            Dictionary with feature names and values
        """
        features = {}
        
        # Simulate MFCC features (13 coefficients)
        for i in range(13):
            features[f"mfcc_mean_{i}"] = float(np.random.normal(loc=20 - i*1.5, scale=5))
            features[f"mfcc_std_{i}"] = float(np.abs(np.random.normal(loc=5, scale=2)))
        
        # Spectral Features
        features["spectral_centroid_mean"] = float(np.random.uniform(2000, 5000))
        features["spectral_centroid_std"] = float(np.random.uniform(500, 1500))
        features["spectral_rolloff_mean"] = float(np.random.uniform(8000, 12000))
        features["spectral_rolloff_std"] = float(np.random.uniform(1000, 3000))
        
        # Zero Crossing Rate
        features["zcr_mean"] = float(np.random.uniform(0.05, 0.15))
        features["zcr_std"] = float(np.random.uniform(0.01, 0.05))
        
        # Chroma Features (12-dimensional)
        for i in range(12):
            features[f"chroma_mean_{i}"] = float(np.random.uniform(0.1, 0.3))
        
        # Energy Features
        features["rms_energy_mean"] = float(np.random.uniform(0.1, 0.3))
        features["rms_energy_std"] = float(np.random.uniform(0.02, 0.1))
        
        # Temporal Features
        features["zero_crossing_rate_mean"] = float(np.random.uniform(0.05, 0.2))
        features["spectral_flux_mean"] = float(np.random.uniform(1, 5))
        
        return features
    
    def extract_from_multiple_files(self, file_paths):
        """
        Extract features from multiple audio files.
        
        Parameters:
        -----------
        file_paths : list
            List of audio file paths
            
        Returns:
        --------
        feature_matrix : ndarray
            Shape (num_files, num_features)
        """
        features_list = []
        
        for filepath in file_paths:
            # Mock: would load actual audio file
            mock_audio = np.random.randn(22050)  # 1 second at 22050 Hz
            features = self.extract_features(mock_audio)
            feature_values = [features[name] for name in self.feature_names]
            features_list.append(feature_values)
        
        return np.array(features_list)
    
    @staticmethod
    def feature_descriptions():
        """Return descriptions of each feature for academic understanding."""
        return {
            "MFCC": {
                "description": "Mel-Frequency Cepstral Coefficients",
                "explanation": "Represents the power spectrum of sound on the mel scale, which approximates human auditory perception.",
                "why_useful": "Captures spectral characteristics that distinguish different animal vocalizations and poaching activities.",
                "num_coefficients": 13
            },
            "Spectral_Centroid": {
                "description": "Center of mass of the frequency spectrum",
                "explanation": "The average frequency weighted by magnitude. Indicates the 'brightness' or 'harshness' of sound.",
                "why_useful": "Helps distinguish high-pitched animal calls from low-frequency human voices and engine sounds."
            },
            "Zero_Crossing_Rate": {
                "description": "Number of times signal crosses zero amplitude per frame",
                "explanation": "Low ZCR indicates sustained tones (animal calls), high ZCR indicates noise (human activity).",
                "why_useful": "Discriminates between natural animal sounds and human-generated noise/equipment."
            },
            "Chroma_Features": {
                "description": "Distribution of energy across 12 musical pitch classes",
                "explanation": "Represents which pitches are most prominent in the audio.",
                "why_useful": "Captures harmonic structure useful for recognizing repeated poaching-related sounds (e.g., vehicle engines)."
            },
            "RMS_Energy": {
                "description": "Root Mean Square energy - overall loudness",
                "explanation": "Represents the amplitude/volume of the signal over time.",
                "why_useful": "Distinguishes loud equipment sounds (vehicles, chainsaws) from quiet animal vocalizations."
            },
            "Spectral_Rolloff": {
                "description": "Frequency below which 95% of energy is concentrated",
                "explanation": "Indicates the width of the frequency spectrum.",
                "why_useful": "Narrow rolloff indicates pure tones, wide rolloff indicates noise (useful for poacher detection)."
            }
        }


# ============================================================================
# DATASET PREPARATION
# ============================================================================

class AudioDatasetGenerator:
    """
    Generate synthetic audio dataset for demonstration.
    In production, this would use actual audio recordings.
    """
    
    AUDIO_CLASSES = {
        "elephant": 0,      # Elephant calls
        "lion": 1,          # Lion roars
        "bird": 2,          # Bird vocalizations
        "rain": 3,          # Rain sounds
        "wind": 4,          # Wind sounds
        "vehicle": 5,       # Vehicle engine (poaching indicator)
        "chainsaw": 6,      # Chainsaw (poaching indicator)
        "gunshot": 7        # Gunshot (emergency alert)
    }
    
    @staticmethod
    def generate_labeled_dataset(num_samples_per_class=50):
        """
        Generate synthetic labeled audio dataset.
        
        Returns:
        --------
        data : dict with keys 'features', 'labels', 'class_names'
        """
        extractor = AudioFeatureExtractor()
        features_list = []
        labels_list = []
        
        for class_name, class_id in AudioDatasetGenerator.AUDIO_CLASSES.items():
            for _ in range(num_samples_per_class):
                mock_audio = np.random.randn(22050)
                features_dict = extractor.extract_features(mock_audio)
                feature_values = [features_dict[name] for name in extractor.feature_names]
                features_list.append(feature_values)
                labels_list.append(class_id)
        
        return {
            "features": np.array(features_list),
            "labels": np.array(labels_list),
            "class_names": list(AudioDatasetGenerator.AUDIO_CLASSES.keys()),
            "num_samples": len(labels_list),
            "num_features": len(extractor.feature_names),
            "feature_names": extractor.feature_names
        }


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    """
    Extract audio features and prepare dataset.
    """
    print("\n" + "="*70)
    print("AUDIO FEATURE EXTRACTION")
    print("="*70)
    
    # Initialize extractor
    extractor = AudioFeatureExtractor()
    
    print(f"\n✓ Feature Extractor initialized")
    print(f"✓ Total features: {extractor.num_features}")
    print(f"\nFeature list:")
    for i, feature in enumerate(extractor.feature_names, 1):
        print(f"  {i:2d}. {feature}")
    
    # Display feature descriptions
    print("\n" + "="*70)
    print("FEATURE DESCRIPTIONS (Academic Reference)")
    print("="*70)
    
    descriptions = AudioFeatureExtractor.feature_descriptions()
    for feature_type, details in descriptions.items():
        print(f"\n📊 {feature_type.replace('_', ' ')}:")
        print(f"   Description: {details['description']}")
        print(f"   Explanation: {details['explanation']}")
        print(f"   Why useful: {details['why_useful']}")
    
    # Generate labeled dataset
    print("\n" + "="*70)
    print("GENERATING SYNTHETIC AUDIO DATASET")
    print("="*70)
    
    dataset = AudioDatasetGenerator.generate_labeled_dataset(num_samples_per_class=50)
    
    print(f"\n✓ Dataset generated successfully")
    print(f"  • Total samples: {dataset['num_samples']}")
    print(f"  • Features per sample: {dataset['num_features']}")
    print(f"  • Classes: {', '.join(dataset['class_names'])}")
    print(f"  • Samples per class: 50")
    
    # Save dataset info
    dataset_info = {
        "timestamp": datetime.now().isoformat(),
        "num_samples": int(dataset['num_samples']),
        "num_features": int(dataset['num_features']),
        "feature_names": dataset['feature_names'],
        "classes": dataset['class_names'],
        "samples_per_class": 50
    }
    
    with open("audio_dataset_info.json", 'w') as f:
        json.dump(dataset_info, f, indent=2)
    
    print(f"\n✅ Dataset info saved to audio_dataset_info.json")
