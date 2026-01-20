"""
Image Model Training Script (Transfer Learning)
================================================
Train image classification models for wildlife detection using transfer learning.

This script:
1. Loads images from local dataset folders
2. Uses pre-trained MobileNet/ResNet for feature extraction
3. Fine-tunes the model on wildlife data
4. Evaluates performance
5. Saves the trained model

Transfer Learning Approach:
- We use a pre-trained CNN (trained on ImageNet with millions of images)
- We freeze the feature extraction layers (convolutional base)
- We train only the classification head on our wildlife data
- This is much faster and requires less data than training from scratch

Dataset Structure:
datasets/images/
├── animal/     # Wildlife images (elephants, rhinos, etc.)
└── human/      # Human/poacher images

Author: MCA Student
Date: 2026
"""

import os
import numpy as np
import pickle
import json
from pathlib import Path
from datetime import datetime
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

# Deep learning imports
try:
    from tensorflow import keras  # type: ignore
    from tensorflow.keras.preprocessing.image import ImageDataGenerator  # type: ignore
    from tensorflow.keras.applications import MobileNetV2  # type: ignore
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout  # type: ignore
    from tensorflow.keras.models import Model  # type: ignore
    from tensorflow.keras.optimizers import Adam  # type: ignore
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint  # type: ignore
    TENSORFLOW_AVAILABLE = True
except ImportError:
    print("⚠ TensorFlow not installed. Using sklearn-based approach instead.")
    TENSORFLOW_AVAILABLE = False


# ============================================================================
# CONFIGURATION
# ============================================================================

DATASET_PATH = Path(__file__).parent / "datasets" / "images"
RESULTS_PATH = Path(__file__).parent / "results"
MODELS_PATH = Path(__file__).parent / "trained_models"

# Image parameters
IMG_SIZE = 224  # MobileNet input size
BATCH_SIZE = 32
EPOCHS = 20
LEARNING_RATE = 0.0001

# Categories
CATEGORIES = ['animal', 'human']


# ============================================================================
# ACADEMIC EXPLANATION: TRANSFER LEARNING
# ============================================================================

def explain_transfer_learning():
    """
    Print academic explanation of transfer learning.
    
    This helps students understand WHY we use transfer learning.
    """
    print("\n" + "=" * 70)
    print("TRANSFER LEARNING: ACADEMIC EXPLANATION")
    print("=" * 70)
    print("""
📚 What is Transfer Learning?

Transfer learning is a technique where we use a model pre-trained on a large
dataset (like ImageNet with 14 million images) and adapt it to our specific
task (wildlife detection).

🔹 Why Transfer Learning?

1. **Less Data Required**
   - Training a CNN from scratch requires millions of images
   - Transfer learning works well with just hundreds/thousands of images
   
2. **Faster Training**
   - Pre-trained features already learned (edges, shapes, textures)
   - We only train the final classification layers
   - Training time: hours instead of days/weeks
   
3. **Better Performance**
   - Leverages knowledge from ImageNet (1000 object classes)
   - Pre-trained features generalize well to new tasks
   - Often achieves higher accuracy than training from scratch

🔹 How It Works?

1. **Feature Extraction**
   - Use pre-trained MobileNet/ResNet as feature extractor
   - Freeze convolutional layers (don't train them)
   - These layers detect edges, textures, shapes, patterns
   
2. **Fine-Tuning**
   - Add new classification layers for our task (animal vs human)
   - Train only these new layers on our wildlife data
   - The model learns to map pre-trained features to our classes

3. **Architecture**
   ```
   Input Image (224x224x3)
          ↓
   [Pre-trained CNN Layers] ← Frozen (feature extraction)
          ↓
   [Global Average Pooling]
          ↓
   [Dense Layer + Dropout] ← Trainable (classification)
          ↓
   [Output Layer: 2 classes] ← animal or human
   ```

🔹 MobileNet vs ResNet?

**MobileNet:**
- Lightweight (14 MB)
- Fast inference (good for edge devices)
- Suitable for camera traps with limited resources
- Accuracy: ~71% on ImageNet

**ResNet50:**
- More parameters (98 MB)
- Higher accuracy (~76% on ImageNet)
- Slower inference
- Better if accuracy is priority over speed

For WildGuard, we use **MobileNetV2** because:
✓ Fast enough for real-time detection on camera traps
✓ Small enough to run on edge devices (Raspberry Pi)
✓ Good accuracy for wildlife vs human classification
✓ Proven track record in mobile vision applications
""")
    input("\nPress Enter to continue training...")


# ============================================================================
# STEP 1: LOAD AND PREPARE IMAGE DATASET
# ============================================================================

def count_images_in_dataset():
    """Count images in each category."""
    print("\n" + "=" * 70)
    print("STEP 1: CHECKING IMAGE DATASET")
    print("=" * 70)
    
    counts = {}
    for category in CATEGORIES:
        category_path = DATASET_PATH / category
        if category_path.exists():
            image_files = list(category_path.glob("*.jpg")) + \
                         list(category_path.glob("*.jpeg")) + \
                         list(category_path.glob("*.png"))
            counts[category] = len(image_files)
            print(f"✓ {category}: {counts[category]} images")
        else:
            counts[category] = 0
            print(f"✗ {category}: Folder not found!")
    
    total = sum(counts.values())
    print(f"\nTotal images: {total}")
    
    return counts, total


def create_data_generators():
    """
    Create data generators for training and validation.
    
    Academic Note:
        Data augmentation improves model generalization by creating
        variations of training images (rotation, flip, zoom, etc.)
        This prevents overfitting and makes the model more robust.
    """
    print("\n" + "=" * 70)
    print("STEP 2: CREATING DATA GENERATORS")
    print("=" * 70)
    
    # Training data augmentation
    # We apply transformations to increase dataset diversity
    train_datagen = ImageDataGenerator(
        rescale=1./255,           # Normalize pixel values to [0, 1]
        rotation_range=20,         # Random rotation up to 20 degrees
        width_shift_range=0.2,     # Random horizontal shift
        height_shift_range=0.2,    # Random vertical shift
        horizontal_flip=True,      # Random horizontal flip
        zoom_range=0.2,           # Random zoom
        validation_split=0.2       # Use 20% for validation
    )
    
    # Validation data - only rescaling (no augmentation)
    # We don't augment validation data to get true performance
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Create training generator
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # Create validation generator
    val_generator = val_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    print(f"✓ Training samples: {train_generator.samples}")
    print(f"✓ Validation samples: {val_generator.samples}")
    print(f"✓ Class indices: {train_generator.class_indices}")
    
    return train_generator, val_generator


# ============================================================================
# STEP 3: BUILD TRANSFER LEARNING MODEL
# ============================================================================

def build_transfer_learning_model():
    """
    Build a transfer learning model using MobileNetV2.
    
    Academic Note:
        Model architecture:
        1. Input layer: 224x224x3 (RGB images)
        2. MobileNetV2 base: Pre-trained on ImageNet (frozen)
        3. Global Average Pooling: Reduces spatial dimensions
        4. Dense layer: 128 neurons with ReLU activation
        5. Dropout: 50% to prevent overfitting
        6. Output layer: 2 neurons with softmax (animal vs human)
    """
    print("\n" + "=" * 70)
    print("STEP 3: BUILDING TRANSFER LEARNING MODEL")
    print("=" * 70)
    
    # Load pre-trained MobileNetV2 (without top classification layer)
    print("\n📥 Loading pre-trained MobileNetV2...")
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,  # Don't include ImageNet classifier
        weights='imagenet'   # Use ImageNet pre-trained weights
    )
    
    # Freeze the base model layers
    # This prevents them from being updated during training
    base_model.trainable = False
    print(f"✓ Base model loaded: {len(base_model.layers)} layers")
    print(f"✓ Base model frozen (trainable={base_model.trainable})")
    
    # Add custom classification layers
    print("\n🔨 Adding custom classification layers...")
    
    # Global Average Pooling layer
    # Reduces feature maps to single vector
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    
    # Dense layer with 128 neurons
    # Learns to combine features for classification
    x = Dense(128, activation='relu')(x)
    
    # Dropout layer (50% dropout)
    # Randomly drops neurons during training to prevent overfitting
    x = Dropout(0.5)(x)
    
    # Output layer with 2 neurons (animal, human)
    # Softmax activation gives probabilities for each class
    predictions = Dense(len(CATEGORIES), activation='softmax')(x)
    
    # Create final model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print(f"✓ Model built successfully")
    
    # Print model summary
    print("\n📊 Model Summary:")
    print("-" * 70)
    total_params = model.count_params()
    trainable_params = sum([np.prod(v.get_shape()) for v in model.trainable_weights])
    non_trainable_params = sum([np.prod(v.get_shape()) for v in model.non_trainable_weights])
    
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    print(f"Non-trainable parameters: {non_trainable_params:,}")
    print(f"Training only: {(trainable_params/total_params)*100:.1f}% of parameters")
    
    return model


# ============================================================================
# STEP 4: TRAIN THE MODEL
# ============================================================================

def train_model(model, train_generator, val_generator):
    """
    Train the transfer learning model.
    
    Academic Note:
        Training callbacks:
        - EarlyStopping: Stops training if validation loss doesn't improve
        - ModelCheckpoint: Saves best model based on validation accuracy
    """
    print("\n" + "=" * 70)
    print("STEP 4: TRAINING MODEL")
    print("=" * 70)
    
    # Create callbacks
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True,
        verbose=1
    )
    
    model_checkpoint = ModelCheckpoint(
        MODELS_PATH / 'best_image_model.h5',
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    
    print(f"\n🚀 Starting training for {EPOCHS} epochs...")
    print(f"   Batch size: {BATCH_SIZE}")
    print(f"   Learning rate: {LEARNING_RATE}")
    
    # Train the model
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=[early_stopping, model_checkpoint],
        verbose=1
    )
    
    # Get final metrics
    final_train_acc = history.history['accuracy'][-1]
    final_val_acc = history.history['val_accuracy'][-1]
    final_train_loss = history.history['loss'][-1]
    final_val_loss = history.history['val_loss'][-1]
    
    print("\n" + "=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)
    print(f"Final Training Accuracy: {final_train_acc:.4f}")
    print(f"Final Validation Accuracy: {final_val_acc:.4f}")
    print(f"Final Training Loss: {final_train_loss:.4f}")
    print(f"Final Validation Loss: {final_val_loss:.4f}")
    
    return model, history


# ============================================================================
# STEP 5: SAVE RESULTS
# ============================================================================

def save_results(model, history, train_generator, image_counts):
    """Save trained model and experiment results."""
    print("\n" + "=" * 70)
    print("STEP 5: SAVING MODEL AND RESULTS")
    print("=" * 70)
    
    # Create directories
    RESULTS_PATH.mkdir(exist_ok=True)
    MODELS_PATH.mkdir(exist_ok=True)
    
    # Save model
    model_file = MODELS_PATH / "image_classifier.h5"
    model.save(model_file)
    print(f"\n✓ Model saved to: {model_file}")
    
    # Save class indices
    class_indices_file = MODELS_PATH / "class_indices.pkl"
    with open(class_indices_file, 'wb') as f:
        pickle.dump(train_generator.class_indices, f)
    print(f"✓ Class indices saved to: {class_indices_file}")
    
    # Create results JSON
    results_data = {
        'experiment_name': 'Image Classification - Wildlife Detection',
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'approach': 'Transfer Learning with MobileNetV2',
        'dataset': {
            'source': 'Kaggle (Manual Download)',
            'categories': CATEGORIES,
            'image_counts': image_counts,
            'total_images': sum(image_counts.values())
        },
        'model_architecture': {
            'base_model': 'MobileNetV2 (ImageNet pre-trained)',
            'input_size': f'{IMG_SIZE}x{IMG_SIZE}',
            'trainable_layers': 'Classification head only',
            'frozen_layers': 'All convolutional layers'
        },
        'training_parameters': {
            'epochs': EPOCHS,
            'batch_size': BATCH_SIZE,
            'learning_rate': LEARNING_RATE,
            'optimizer': 'Adam',
            'loss_function': 'categorical_crossentropy'
        },
        'data_augmentation': {
            'rotation_range': 20,
            'width_shift': 0.2,
            'height_shift': 0.2,
            'horizontal_flip': True,
            'zoom_range': 0.2
        },
        'results': {
            'final_training_accuracy': float(history.history['accuracy'][-1]),
            'final_validation_accuracy': float(history.history['val_accuracy'][-1]),
            'final_training_loss': float(history.history['loss'][-1]),
            'final_validation_loss': float(history.history['val_loss'][-1]),
            'best_validation_accuracy': float(max(history.history['val_accuracy']))
        },
        'transfer_learning_benefits': {
            'training_time': 'Reduced from days to hours',
            'data_requirement': 'Works with hundreds of images instead of millions',
            'accuracy': 'Higher than training from scratch with limited data',
            'deployment': 'MobileNet is optimized for edge devices'
        }
    }
    
    results_file = RESULTS_PATH / "image_training_results.json"
    with open(results_file, 'w') as f:
        json.dump(results_data, f, indent=4)
    print(f"✓ Results saved to: {results_file}")
    
    print("\n" + "=" * 70)
    print("✅ IMAGE MODEL TRAINING COMPLETE")
    print("=" * 70)
    print(f"\nTrained model: MobileNetV2 Transfer Learning")
    print(f"Model file: {model_file}")
    print(f"Results file: {results_file}")
    print("\nThe model can now be used for wildlife image classification!")


# ============================================================================
# ALTERNATIVE: SKLEARN-BASED APPROACH (if TensorFlow not available)
# ============================================================================

def train_with_sklearn():
    """
    Alternative training approach using scikit-learn.
    Uses simple image features instead of deep learning.
    """
    print("\n⚠ TensorFlow not available. Using scikit-learn approach.")
    print("Note: This is a simplified approach for demonstration.")
    print("For production, install TensorFlow for better accuracy.\n")
    
    from skimage import io, color, transform  # type: ignore
    from skimage.feature import hog  # type: ignore
    # Import sklearn locally to avoid editor unresolved import warnings
    from sklearn.ensemble import RandomForestClassifier  # type: ignore
    from sklearn.model_selection import train_test_split  # type: ignore
    from sklearn.metrics import accuracy_score  # type: ignore
    
    X = []
    y = []
    
    # Load and extract features from images
    for category in CATEGORIES:
        category_path = DATASET_PATH / category
        if not category_path.exists():
            continue
        
        image_files = list(category_path.glob("*.jpg")) + \
                     list(category_path.glob("*.png"))
        
        print(f"Loading {category} images...")
        for img_path in image_files[:200]:  # Limit to 200 per category
            try:
                # Load and resize image
                img = io.imread(img_path)
                img_resized = transform.resize(img, (128, 128))
                
                # Convert to grayscale
                if len(img_resized.shape) == 3:
                    img_gray = color.rgb2gray(img_resized)
                else:
                    img_gray = img_resized
                
                # Extract HOG features
                features = hog(img_gray, pixels_per_cell=(16, 16))
                
                X.append(features)
                y.append(category)
            except:
                continue
    
    X = np.array(X)
    y = np.array(y)
    
    # Train Random Forest
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\n✓ Training complete")
    print(f"   Accuracy: {accuracy:.4f}")
    
    # Save model
    model_file = MODELS_PATH / "image_classifier_sklearn.pkl"
    with open(model_file, 'wb') as f:
        pickle.dump(clf, f)
    print(f"✓ Model saved to: {model_file}")


# ============================================================================
# MAIN TRAINING PIPELINE
# ============================================================================

def main():
    """Main training pipeline."""
    print("\n🖼️ WildGuard Image Classification Training")
    print("=" * 70)
    print("This script uses Transfer Learning with MobileNetV2")
    print("=" * 70)
    
    # Check dataset
    image_counts, total = count_images_in_dataset()
    
    if total == 0:
        print("\n❌ ERROR: No images found!")
        print("Please add images to the datasets/images/ folders.")
        print("Refer to datasets/README.md for instructions.")
        return
    
    if total < 100:
        print("\n⚠ WARNING: Very few images found!")
        print("For better results, add more images (recommended: 500+ per category)")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            return
    
    # Show transfer learning explanation
    explain_transfer_learning()
    
    if not TENSORFLOW_AVAILABLE:
        train_with_sklearn()
        return
    
    # Create data generators
    train_gen, val_gen = create_data_generators()
    
    # Build model
    model = build_transfer_learning_model()
    
    # Train model
    model, history = train_model(model, train_gen, val_gen)
    
    # Save results
    save_results(model, history, train_gen, image_counts)


if __name__ == "__main__":
    main()
