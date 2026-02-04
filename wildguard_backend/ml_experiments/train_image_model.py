"""
Image Model Training Script - YOLOv8
====================================
Train YOLOv8 image classification model for wildlife detection.

Based on the model comparison results, YOLOv8 was selected as the best model for
wildlife monitoring due to:
- Highest accuracy (98.15%)
- Fastest inference (14.2ms = 70 FPS)
- Multi-object detection capability
- Bounding box support for evidence storage

This script:
1. Prepares dataset in YOLOv8 format
2. Trains YOLOv8 classification model
3. Evaluates performance
4. Saves the trained model (.pt and .onnx)

Dataset Structure:
datasets/images/
├── animal/     # Wildlife images
└── human/      # Human/poacher images

Author: MCA Student
Date: 2026
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# CONFIGURATION
# ============================================================================

DATASET_PATH = Path(__file__).parent / "datasets" / "images"
YOLO_DATASET_PATH = Path(__file__).parent / "datasets" / "yolo_classification"
RESULTS_PATH = Path(__file__).parent / "results"
MODELS_PATH = Path(__file__).parent / "trained_models"

# Training parameters
IMG_SIZE = 224
EPOCHS = 30  # YOLOv8 trains faster, can use more epochs
BATCH_SIZE = 16
MODEL_SIZE = 'n'  # Options: n (nano), s (small), m (medium), l (large), x (xlarge)

# Categories
CATEGORIES = ['animal', 'human']

# Ensure directories exist
RESULTS_PATH.mkdir(exist_ok=True)
MODELS_PATH.mkdir(exist_ok=True)


# ============================================================================
# ACADEMIC EXPLANATION: YOLOv8
# ============================================================================

def explain_yolov8():
    """Print academic explanation of YOLOv8."""
    print("\n" + "=" * 70)
    print("YOLOv8: ACADEMIC EXPLANATION")
    print("=" * 70)
    print("""
📚 What is YOLOv8?

YOLOv8 (You Only Look Once version 8) is the latest state-of-the-art
object detection model from Ultralytics. It can perform:
- Image Classification
- Object Detection
- Instance Segmentation
- Pose Estimation

🔹 Why YOLOv8 for WildGuard?

1. **Multi-Object Detection**
   - Detects multiple animals AND humans in a single frame
   - Critical for anti-poaching surveillance
   
2. **Real-Time Performance**
   - 70+ FPS on GPU, 10+ FPS on CPU
   - Suitable for continuous camera trap monitoring
   
3. **Bounding Box Support**
   - Provides exact location of detected objects
   - Essential for evidence storage and tracking
   
4. **Edge Deployment**
   - Export to ONNX, TensorRT, CoreML
   - Runs on Jetson Nano, Raspberry Pi

🔹 Model Comparison Results (on our dataset):

   Model          | Accuracy | Inference | Score
   ---------------|----------|-----------|-------
   YOLOv8 Small   | 98.15%   | 14.2ms    | 9.80 ⭐
   MobileNetV2    | 96.15%   | 159.6ms   | 6.45
   BasicCNN       | 76.92%   | 87.6ms    | 5.77
   ResNet50       | 57.69%   | 251.4ms   | 4.69

✓ YOLOv8 achieved the highest accuracy AND fastest inference!
    """)
    input("\nPress Enter to continue training...")


# ============================================================================
# DATASET PREPARATION
# ============================================================================

def prepare_yolo_dataset():
    """Prepare dataset in YOLOv8 classification format."""
    print("\n" + "=" * 70)
    print("STEP 1: PREPARING YOLO DATASET")
    print("=" * 70)
    
    # Check source dataset
    if not DATASET_PATH.exists():
        print(f"❌ Dataset not found at {DATASET_PATH}")
        return False
    
    # Clean existing YOLO dataset
    if YOLO_DATASET_PATH.exists():
        shutil.rmtree(YOLO_DATASET_PATH)
    
    # Create directory structure
    for split in ['train', 'val']:
        for cat in CATEGORIES:
            (YOLO_DATASET_PATH / split / cat).mkdir(parents=True, exist_ok=True)
    
    # Count and copy images
    total_images = 0
    for cat in CATEGORIES:
        src_dir = DATASET_PATH / cat
        if not src_dir.exists():
            print(f"  ⚠ Category '{cat}' not found")
            continue
        
        images = list(src_dir.glob("*.jpg")) + list(src_dir.glob("*.png"))
        print(f"  {cat}: {len(images)} images")
        total_images += len(images)
        
        # Split 80/20
        split_idx = int(len(images) * 0.8)
        
        for i, img in enumerate(images):
            dst_split = 'train' if i < split_idx else 'val'
            shutil.copy(img, YOLO_DATASET_PATH / dst_split / cat / img.name)
    
    train_count = sum(len(list((YOLO_DATASET_PATH / 'train' / cat).glob("*"))) for cat in CATEGORIES)
    val_count = sum(len(list((YOLO_DATASET_PATH / 'val' / cat).glob("*"))) for cat in CATEGORIES)
    
    print(f"\n✓ Dataset prepared successfully")
    print(f"  Training samples: {train_count}")
    print(f"  Validation samples: {val_count}")
    
    return True


# ============================================================================
# MODEL TRAINING
# ============================================================================

def train_yolov8():
    """Train YOLOv8 classification model."""
    print("\n" + "=" * 70)
    print("STEP 2: TRAINING YOLOv8 MODEL")
    print("=" * 70)
    
    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ ultralytics not installed. Installing...")
        os.system("pip install ultralytics -q")
        from ultralytics import YOLO
    
    # Load pre-trained YOLOv8 classification model
    model_name = f'yolov8{MODEL_SIZE}-cls.pt'
    print(f"\n  Loading pre-trained model: {model_name}")
    model = YOLO(model_name)
    
    print(f"\n  Training parameters:")
    print(f"    Image size: {IMG_SIZE}")
    print(f"    Epochs: {EPOCHS}")
    print(f"    Batch size: {BATCH_SIZE}")
    print(f"    Model: YOLOv8{MODEL_SIZE.upper()}-cls")
    
    # Train
    print("\n  Starting training...")
    results = model.train(
        data=str(YOLO_DATASET_PATH),
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        project=str(MODELS_PATH),
        name='yolov8_wildlife',
        exist_ok=True,
        pretrained=True,
        optimizer='Adam',
        lr0=0.001,
        patience=10,  # Early stopping
        verbose=True
    )
    
    return model, results


def evaluate_model(model):
    """Evaluate trained model."""
    print("\n" + "=" * 70)
    print("STEP 3: EVALUATING MODEL")
    print("=" * 70)
    
    # Validate on validation set
    metrics = model.val(data=str(YOLO_DATASET_PATH), split='val')
    
    # Get metrics
    top1_acc = metrics.results_dict.get('metrics/accuracy_top1', 0)
    top5_acc = metrics.results_dict.get('metrics/accuracy_top5', 0)
    
    print(f"\n  ✓ Top-1 Accuracy: {top1_acc:.4f}")
    print(f"  ✓ Top-5 Accuracy: {top5_acc:.4f}")
    
    return {
        'top1_accuracy': float(top1_acc),
        'top5_accuracy': float(top5_acc)
    }


def save_model(model):
    """Save trained model in multiple formats."""
    print("\n" + "=" * 70)
    print("STEP 4: SAVING MODEL")
    print("=" * 70)
    
    # Best model path
    best_model_path = MODELS_PATH / 'yolov8_wildlife' / 'weights' / 'best.pt'
    
    if best_model_path.exists():
        # Copy to trained_models
        final_path = MODELS_PATH / 'yolov8_image_classifier.pt'
        shutil.copy(best_model_path, final_path)
        print(f"  ✓ PyTorch model: {final_path}")
        
        # Export to ONNX for deployment
        try:
            model.export(format='onnx', imgsz=IMG_SIZE)
            onnx_src = MODELS_PATH / 'yolov8_wildlife' / 'weights' / 'best.onnx'
            onnx_dst = MODELS_PATH / 'yolov8_image_classifier.onnx'
            if onnx_src.exists():
                shutil.copy(onnx_src, onnx_dst)
                print(f"  ✓ ONNX model: {onnx_dst}")
        except Exception as e:
            print(f"  ⚠ ONNX export skipped: {e}")
    
    return best_model_path


def save_results(metrics, training_time):
    """Save training results."""
    results = {
        'timestamp': datetime.now().isoformat(),
        'model': f'YOLOv8{MODEL_SIZE.upper()}-cls',
        'model_file': str(MODELS_PATH / 'yolov8_image_classifier.pt'),
        'dataset': str(YOLO_DATASET_PATH),
        'training_params': {
            'epochs': EPOCHS,
            'batch_size': BATCH_SIZE,
            'image_size': IMG_SIZE,
            'model_size': MODEL_SIZE
        },
        'metrics': metrics,
        'training_time_seconds': training_time,
        'categories': CATEGORIES
    }
    
    results_file = RESULTS_PATH / 'image_training_results.json'
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"  ✓ Results saved: {results_file}")
    
    return results_file


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main training pipeline."""
    print("\n" + "=" * 70)
    print("🎯 WILDGUARD YOLOv8 IMAGE MODEL TRAINING")
    print("=" * 70)
    print("Training YOLOv8 classification model for wildlife detection")
    print("=" * 70)
    
    # Academic explanation
    explain_yolov8()
    
    # Step 1: Prepare dataset
    if not prepare_yolo_dataset():
        print("\n❌ Failed to prepare dataset. Exiting.")
        return
    
    # Step 2: Train model
    import time
    start_time = time.time()
    model, results = train_yolov8()
    training_time = time.time() - start_time
    
    # Step 3: Evaluate
    metrics = evaluate_model(model)
    
    # Step 4: Save model
    model_path = save_model(model)
    
    # Step 5: Save results
    results_file = save_results(metrics, training_time)
    
    # Summary
    print("\n" + "=" * 70)
    print("✅ TRAINING COMPLETE")
    print("=" * 70)
    print(f"""
  Model: YOLOv8{MODEL_SIZE.upper()}-cls
  Accuracy: {metrics['top1_accuracy']:.2%}
  Training Time: {training_time:.1f}s
  
  Model File: {MODELS_PATH / 'yolov8_image_classifier.pt'}
  Results: {results_file}
  
  The model is ready for wildlife image classification!
    """)
    
    # Cleanup YOLO dataset (optional)
    # shutil.rmtree(YOLO_DATASET_PATH, ignore_errors=True)


if __name__ == "__main__":
    main()
