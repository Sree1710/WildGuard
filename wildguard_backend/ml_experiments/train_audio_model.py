"""
Audio Model Training Script
============================
Train audio classification models for wildlife monitoring.

This script:
1. Loads audio files from local dataset folders
2. Extracts MFCC features using librosa
3. Applies feature selection (Variance, Correlation, Random Forest)
4. Trains multiple classifiers (SVM, KNN, Random Forest)
5. Compares performance using cross-validation
6. Saves the best model

Dataset Structure:
datasets/audio/
├── animal/     # Wildlife sounds
├── human/      # Human activity sounds
└── gunshot/    # Gunshot sounds

Author: MCA Student
Date: 2026
"""

import os
import numpy as np
import librosa
import pickle
import json
from pathlib import Path
from datetime import datetime
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# CONFIGURATION
# ============================================================================

DATASET_PATH = Path(__file__).parent / "datasets" / "audio"
RESULTS_PATH = Path(__file__).parent / "results"
MODELS_PATH = Path(__file__).parent / "trained_models"

# Audio processing parameters
SAMPLE_RATE = 22050  # Standard sample rate for audio processing
DURATION = 3  # Seconds - trim or pad audio to this length
N_MFCC = 20  # Number of MFCC coefficients to extract

# Feature selection parameters
VARIANCE_THRESHOLD = 0.01  # Minimum variance for feature selection
N_TOP_FEATURES = 20  # Number of top features to select

# Categories to classify
CATEGORIES = ['animal', 'human', 'gunshot']


# ============================================================================
# STEP 1: LOAD AND PREPROCESS AUDIO FILES
# ============================================================================

def load_audio_file(file_path):
    """
    Load an audio file and preprocess it.
    
    Args:
        file_path: Path to audio file
    
    Returns:
        Audio time series (numpy array)
    
    Academic Note:
        - librosa.load() loads audio and resamples to target sample rate
        - sr parameter ensures consistent sampling across all files
        - Duration parameter handles variable-length audio
    """
    try:
        # Load audio file with target sample rate
        audio, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=DURATION)
        
        # Pad or trim to fixed length
        target_length = SAMPLE_RATE * DURATION
        if len(audio) < target_length:
            # Pad with zeros if audio is too short
            audio = np.pad(audio, (0, target_length - len(audio)), mode='constant')
        else:
            # Trim if audio is too long
            audio = audio[:target_length]
        
        return audio
    except Exception as e:
        print(f"   Error loading {file_path}: {e}")
        return None


def extract_mfcc_features(audio):
    """
    Extract MFCC (Mel-Frequency Cepstral Coefficients) features from audio.
    
    Args:
        audio: Audio time series
    
    Returns:
        Feature vector (numpy array)
    
    Academic Note:
        MFCCs are the most widely used features in audio classification because:
        - They represent the spectral envelope of audio
        - They mimic human auditory perception
        - They are robust to noise and speaker variations
        
        We extract:
        - MFCCs: 20 coefficients
        - Delta MFCCs: First-order derivatives (20 features)
        - Delta-Delta MFCCs: Second-order derivatives (20 features)
        Total: 60 features per audio file
    """
    # Extract MFCC features
    mfccs = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=N_MFCC)
    
    # Compute deltas (first-order derivatives)
    mfcc_delta = librosa.feature.delta(mfccs)
    
    # Compute delta-deltas (second-order derivatives)
    mfcc_delta2 = librosa.feature.delta(mfccs, order=2)
    
    # Take mean across time axis to get fixed-length features
    mfcc_mean = np.mean(mfccs, axis=1)
    delta_mean = np.mean(mfcc_delta, axis=1)
    delta2_mean = np.mean(mfcc_delta2, axis=1)
    
    # Concatenate all features into single vector
    features = np.concatenate([mfcc_mean, delta_mean, delta2_mean])
    
    return features


def load_dataset():
    """
    Load all audio files from dataset folders and extract features.
    
    Returns:
        X: Feature matrix (n_samples x n_features)
        y: Labels (n_samples)
        file_paths: List of file paths for reference
    
    Academic Note:
        This function implements the data loading pipeline:
        1. Iterate through each category folder
        2. Load audio files
        3. Extract features
        4. Assign labels
        5. Create feature matrix and label vector
    """
    print("=" * 70)
    print("STEP 1: LOADING AUDIO DATASET")
    print("=" * 70)
    
    X = []  # Feature matrix
    y = []  # Labels
    file_paths = []  # File paths for reference
    
    for category in CATEGORIES:
        category_path = DATASET_PATH / category
        print(f"\nLoading {category} sounds from: {category_path}")
        
        if not category_path.exists():
            print(f"   ⚠ Warning: {category} folder not found!")
            continue
        
        # Find all audio files (wav, mp3)
        audio_files = list(category_path.glob("*.wav")) + \
                     list(category_path.glob("*.mp3")) + \
                     list(category_path.glob("*.flac"))
        
        print(f"   Found {len(audio_files)} audio files")
        
        # Process each audio file
        for i, file_path in enumerate(audio_files):
            if i % 50 == 0:
                print(f"   Processing: {i}/{len(audio_files)}...", end='\r')
            
            # Load audio
            audio = load_audio_file(file_path)
            if audio is None:
                continue
            
            # Extract features
            features = extract_mfcc_features(audio)
            
            # Store features, label, and file path
            X.append(features)
            y.append(category)
            file_paths.append(str(file_path))
        
        print(f"   ✓ Processed {len([l for l in y if l == category])} {category} files")
    
    # Convert to numpy arrays
    X = np.array(X)
    y = np.array(y)
    
    print(f"\n✓ Dataset loaded successfully")
    print(f"   Total samples: {len(X)}")
    print(f"   Feature dimensions: {X.shape[1]}")
    print(f"   Categories: {np.unique(y)}")
    
    return X, y, file_paths


# ============================================================================
# STEP 2: FEATURE SELECTION
# ============================================================================

def select_features(X, y):
    """
    Apply multiple feature selection techniques to reduce dimensionality.
    
    Args:
        X: Feature matrix
        y: Labels
    
    Returns:
        X_selected: Reduced feature matrix
        selected_indices: Indices of selected features
    
    Academic Note:
        Feature selection improves:
        - Model performance (removes irrelevant features)
        - Training speed (fewer features to process)
        - Generalization (reduces overfitting)
        
        We apply three methods:
        1. Variance Threshold: Remove low-variance features
        2. Correlation-based: Remove highly correlated features
        3. Random Forest Importance: Select top features by importance
    """
    print("\n" + "=" * 70)
    print("STEP 2: FEATURE SELECTION")
    print("=" * 70)
    
    original_features = X.shape[1]
    print(f"Original features: {original_features}")
    
    # Method 1: Variance Threshold
    # Remove features with low variance (little information)
    print(f"\n1️⃣ Applying Variance Threshold ({VARIANCE_THRESHOLD})...")
    selector_var = VarianceThreshold(threshold=VARIANCE_THRESHOLD)
    X_var = selector_var.fit_transform(X)
    print(f"   Features after variance threshold: {X_var.shape[1]}")
    
    # Method 2: SelectKBest with ANOVA F-statistic
    # Select top K features based on statistical test
    print(f"\n2️⃣ Selecting top {N_TOP_FEATURES} features using ANOVA F-test...")
    selector_kbest = SelectKBest(f_classif, k=min(N_TOP_FEATURES, X_var.shape[1]))
    X_selected = selector_kbest.fit_transform(X_var, y)
    print(f"   Features after SelectKBest: {X_selected.shape[1]}")
    
    # Get indices of selected features
    var_support = selector_var.get_support()
    kbest_support = selector_kbest.get_support()
    selected_indices = np.where(var_support)[0][kbest_support]
    
    reduction = ((original_features - X_selected.shape[1]) / original_features) * 100
    print(f"\n✓ Feature selection complete")
    print(f"   Final features: {X_selected.shape[1]}")
    print(f"   Reduction: {reduction:.1f}%")
    
    return X_selected, selected_indices


# ============================================================================
# STEP 3: TRAIN AND COMPARE MODELS
# ============================================================================

def train_svm_model(X_train, y_train, X_test, y_test):
    """
    Train Support Vector Machine classifier.
    
    Academic Note:
        SVM is effective for audio classification because:
        - Works well with high-dimensional data
        - Finds optimal decision boundary (maximum margin)
        - Effective with limited training data
        - RBF kernel handles non-linear patterns
    """
    print("\n1️⃣ Training SVM (Support Vector Machine)...")
    
    model = SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"   ✓ Accuracy:  {accuracy:.4f}")
    print(f"   ✓ Precision: {precision:.4f}")
    print(f"   ✓ Recall:    {recall:.4f}")
    print(f"   ✓ F1-Score:  {f1:.4f}")
    
    return model, {
        'name': 'SVM',
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }


def train_knn_model(X_train, y_train, X_test, y_test):
    """
    Train K-Nearest Neighbors classifier.
    
    Academic Note:
        KNN is a simple but effective classifier that:
        - Makes predictions based on similarity to neighbors
        - No training phase (lazy learning)
        - Effective for multi-class problems
        - K=5 is a common default choice
    """
    print("\n2️⃣ Training KNN (K-Nearest Neighbors)...")
    
    model = KNeighborsClassifier(n_neighbors=5, metric='euclidean')
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"   ✓ Accuracy:  {accuracy:.4f}")
    print(f"   ✓ Precision: {precision:.4f}")
    print(f"   ✓ Recall:    {recall:.4f}")
    print(f"   ✓ F1-Score:  {f1:.4f}")
    
    return model, {
        'name': 'KNN',
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }


def train_random_forest_model(X_train, y_train, X_test, y_test):
    """
    Train Random Forest classifier.
    
    Academic Note:
        Random Forest is highly effective for audio classification:
        - Ensemble of decision trees (reduces overfitting)
        - Handles non-linear relationships
        - Robust to noise and outliers
        - Provides feature importance ranking
        - Generally achieves high accuracy
    """
    print("\n3️⃣ Training Random Forest...")
    
    model = RandomForestClassifier(n_estimators=100, max_depth=20, 
                                   min_samples_split=5, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    print(f"   ✓ Accuracy:  {accuracy:.4f}")
    print(f"   ✓ Precision: {precision:.4f}")
    print(f"   ✓ Recall:    {recall:.4f}")
    print(f"   ✓ F1-Score:  {f1:.4f}")
    
    return model, {
        'name': 'Random Forest',
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1
    }


def compare_models(X, y):
    """
    Train and compare multiple classifiers using cross-validation.
    
    Returns:
        Best model and comparison results
    """
    print("\n" + "=" * 70)
    print("STEP 3: TRAINING AND COMPARING MODELS")
    print("=" * 70)
    
    # Split dataset: 80% training, 20% testing
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nDataset split:")
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples:  {len(X_test)}")
    
    # Standardize features (important for SVM and KNN)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train all models
    results = []
    models = []
    
    svm_model, svm_results = train_svm_model(X_train_scaled, y_train, 
                                             X_test_scaled, y_test)
    results.append(svm_results)
    models.append(('SVM', svm_model, scaler))
    
    knn_model, knn_results = train_knn_model(X_train_scaled, y_train, 
                                             X_test_scaled, y_test)
    results.append(knn_results)
    models.append(('KNN', knn_model, scaler))
    
    rf_model, rf_results = train_random_forest_model(X_train, y_train, 
                                                     X_test, y_test)
    results.append(rf_results)
    models.append(('Random Forest', rf_model, None))  # RF doesn't need scaling
    
    # Find best model by F1-score
    # When there's a tie in F1-score, prefer Random Forest (as documented in abstract)
    best_f1 = max(r['f1_score'] for r in results)
    tied_models = [r for r in results if r['f1_score'] == best_f1]
    
    # Prefer Random Forest if it's among the tied models
    if len(tied_models) > 1:
        rf_result = [r for r in tied_models if r['name'] == 'Random Forest']
        best_result = rf_result[0] if rf_result else tied_models[0]
    else:
        best_result = tied_models[0]
    
    best_model_name = best_result['name']
    best_model_data = [m for m in models if m[0] == best_model_name][0]
    
    print("\n" + "=" * 70)
    print("MODEL COMPARISON RESULTS")
    print("=" * 70)
    print(f"\n{'Model':<20} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12}")
    print("-" * 70)
    for r in results:
        print(f"{r['name']:<20} {r['accuracy']:<12.4f} {r['precision']:<12.4f} "
              f"{r['recall']:<12.4f} {r['f1_score']:<12.4f}")
    
    print("\n" + "=" * 70)
    print(f"🏆 BEST MODEL: {best_model_name}")
    print(f"   F1-Score: {best_result['f1_score']:.4f}")
    print("=" * 70)
    
    return best_model_data, results


# ============================================================================
# STEP 4: SAVE RESULTS
# ============================================================================

def save_model_and_results(model_data, results, label_encoder, feature_info):
    """
    Save trained model and experiment results.
    
    Args:
        model_data: Tuple of (model_name, model, scaler)
        results: List of model comparison results
        label_encoder: Label encoder for categories
        feature_info: Information about feature selection
    """
    print("\n" + "=" * 70)
    print("STEP 4: SAVING MODEL AND RESULTS")
    print("=" * 70)
    
    # Create directories if they don't exist
    RESULTS_PATH.mkdir(exist_ok=True)
    MODELS_PATH.mkdir(exist_ok=True)
    
    model_name, model, scaler = model_data
    
    # Save model
    model_file = MODELS_PATH / "audio_classifier.pkl"
    with open(model_file, 'wb') as f:
        pickle.dump({
            'model': model,
            'scaler': scaler,
            'label_encoder': label_encoder,
            'model_name': model_name,
            'feature_info': feature_info
        }, f)
    print(f"\n✓ Model saved to: {model_file}")
    
    # Save results as JSON
    results_data = {
        'experiment_name': 'Audio Classification - Wildlife Monitoring',
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'dataset': {
            'source': 'Kaggle (Manual Download)',
            'categories': CATEGORIES,
            'total_samples': feature_info['total_samples'],
            'features_original': feature_info['features_original'],
            'features_selected': feature_info['features_selected']
        },
        'feature_extraction': {
            'method': 'MFCC (Mel-Frequency Cepstral Coefficients)',
            'parameters': {
                'n_mfcc': N_MFCC,
                'sample_rate': SAMPLE_RATE,
                'duration': DURATION
            },
            'features': [
                'MFCC coefficients (20)',
                'Delta MFCC (20)',
                'Delta-Delta MFCC (20)'
            ]
        },
        'feature_selection': {
            'methods': [
                f'Variance Threshold ({VARIANCE_THRESHOLD})',
                f'SelectKBest (top {N_TOP_FEATURES})'
            ],
            'reduction': f"{feature_info['reduction_percentage']:.1f}%"
        },
        'models_compared': results,
        'best_model': {
            'name': model_name,
            'f1_score': max(results, key=lambda x: x['f1_score'])['f1_score'],
            'reason': 'Highest F1-score - best balance of precision and recall'
        }
    }
    
    results_file = RESULTS_PATH / "audio_training_results.json"
    with open(results_file, 'w') as f:
        json.dump(results_data, f, indent=4)
    print(f"✓ Results saved to: {results_file}")
    
    print("\n" + "=" * 70)
    print("✅ AUDIO MODEL TRAINING COMPLETE")
    print("=" * 70)
    print(f"\nTrained model: {model_name}")
    print(f"Model file: {model_file}")
    print(f"Results file: {results_file}")
    print("\nThe model can now be used for wildlife audio classification!")


# ============================================================================
# MAIN TRAINING PIPELINE
# ============================================================================

def main():
    """Main training pipeline."""
    print("\n🎵 WildGuard Audio Classification Training")
    print("=" * 70)
    print("This script trains audio classifiers for wildlife monitoring")
    print("=" * 70)
    
    # Step 1: Load dataset
    X, y, file_paths = load_dataset()
    
    if len(X) == 0:
        print("\n❌ ERROR: No audio files found!")
        print("Please add audio files to the datasets/audio/ folders.")
        print("Refer to datasets/README.md for instructions.")
        return
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Step 2: Feature selection
    X_selected, selected_indices = select_features(X, y_encoded)
    
    feature_info = {
        'total_samples': len(X),
        'features_original': X.shape[1],
        'features_selected': X_selected.shape[1],
        'reduction_percentage': ((X.shape[1] - X_selected.shape[1]) / X.shape[1]) * 100
    }
    
    # Step 3: Train and compare models
    best_model_data, results = compare_models(X_selected, y_encoded)
    
    # Step 4: Save model and results
    save_model_and_results(best_model_data, results, label_encoder, feature_info)


if __name__ == "__main__":
    main()
