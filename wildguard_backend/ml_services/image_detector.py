"""
ML SERVICES - IMAGE DETECTOR
=============================
Production image detection module using the finalized YOLO model.

This module:
- Loads the selected YOLO_v5_small model
- Performs object detection on camera trap images
- Returns detections with confidence scores
- Stores results in MongoDB

Academic Purpose:
Uses only the finalized model selected in ml_experiments/image_model_comparison.py
"""

import os
import json
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple

class ImageDetector:
    """
    YOLO-based image detection for wildlife monitoring.
    
    In production, this would use:
    - import torch
    - from yolov5 import YOLOv5
    
    For this academic project, we use mock implementation.
    """
    
    # Wildlife and poaching-related classes
    WILDLIFE_CLASSES = {
        0: "elephant",
        1: "lion",
        2: "zebra",
        3: "giraffe",
        4: "rhino",
        5: "buffalo",
        6: "antelope",
        7: "wildcat"
    }
    
    THREAT_CLASSES = {
        8: "human",
        9: "vehicle",
        10: "poacher",
        11: "weapon",
        12: "chainsaw",
        13: "snare"
    }
    
    def __init__(self, model_path: str = None, device: str = "auto"):
        """
        Initialize YOLO detector.
        
        Parameters:
        -----------
        model_path : str
            Path to YOLOv5 model weights
        device : str
            Device to use: "cpu", "cuda", or "auto"
        """
        self.model_path = model_path or "ml_services/models/yolov5_small.pt"
        self.device = device
        self.model = None
        self.confidence_threshold = 0.5
        self.iou_threshold = 0.45
        self.load_model()
    
    def load_model(self):
        """
        Load YOLO model from disk.
        
        Production Code (commented):
        ----
        import torch
        self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=self.model_path)
        self.model.conf = self.confidence_threshold
        self.model.iou = self.iou_threshold
        ----
        """
        print(f"[ImageDetector] Loading model from {self.model_path}")
        # Mock loading
        self.model = {
            "name": "yolov5_small",
            "conf": self.confidence_threshold,
            "iou": self.iou_threshold
        }
    
    def predict(self, image_path: str, original_filename: str = None) -> Dict:
        """
        Perform object detection on image.
        
        Parameters:
        -----------
        image_path : str
            Path to image file
        original_filename : str
            Original filename from upload (used for mock hint detection)
            
        Returns:
        --------
        detections : dict
            Dictionary with detection results
        """
        # Production Code (commented):
        # ----
        # results = self.model(image_path)
        # detections = results.pandas().xyxy[0]
        # ----
        
        # Mock detection for academic purpose
        detections = self._mock_detect(image_path, original_filename)
        return detections
    
    def _mock_detect(self, image_path: str, original_filename: str = None) -> Dict:
        """
        Mock detection using filename hints and file-content hashing for
        deterministic, context-aware results.
        """
        import hashlib
        
        # Combine original filename and saved path for hint matching
        hint_text = ""
        if original_filename:
            hint_text += original_filename.lower() + " "
        if image_path:
            hint_text += os.path.basename(image_path).lower()
        
        detections_list = []
        
        # Strategy 1: Filename keyword hints
        threat_keywords = ["hunter", "poacher", "gun", "rifle", "weapon", "man", "human",
                           "person", "people", "soldier", "snare", "trap", "intruder",
                           "trespasser", "armed", "suspicious", "threat"]
        wildlife_map = {
            "elephant": 0, "lion": 1, "zebra": 2, "giraffe": 3,
            "rhino": 4, "buffalo": 5, "antelope": 6, "tiger": 7,
            "leopard": 7, "wildcat": 7, "animal": 0, "wildlife": 0
        }
        
        if any(word in hint_text for word in threat_keywords):
            # Detected a threat — return human/poacher + possibly weapon
            if "poacher" in hint_text or "hunter" in hint_text:
                threat_id = 10  # poacher
            elif "weapon" in hint_text or "gun" in hint_text or "rifle" in hint_text:
                threat_id = 11  # weapon
            else:
                threat_id = 8  # human
            
            detections_list.append({
                "class_id": threat_id,
                "class_name": self.THREAT_CLASSES[threat_id],
                "confidence": float(np.random.uniform(0.88, 0.97)),
                "bbox": {"x_min": 120.0, "y_min": 80.0, "x_max": 380.0, "y_max": 450.0},
                "detection_type": "threat"
            })
            # Also detect weapon if human/poacher
            if threat_id in [8, 10]:
                detections_list.append({
                    "class_id": 11,
                    "class_name": self.THREAT_CLASSES[11],
                    "confidence": float(np.random.uniform(0.78, 0.93)),
                    "bbox": {"x_min": 200.0, "y_min": 180.0, "x_max": 300.0, "y_max": 280.0},
                    "detection_type": "threat"
                })
        
        elif any(word in hint_text for word in wildlife_map.keys()):
            # Detected wildlife via filename
            matched_word = next(w for w in wildlife_map if w in hint_text)
            wildlife_id = wildlife_map[matched_word]
            class_name = self.WILDLIFE_CLASSES.get(wildlife_id, "elephant")
            detections_list.append({
                "class_id": wildlife_id,
                "class_name": class_name,
                "confidence": float(np.random.uniform(0.82, 0.97)),
                "bbox": {"x_min": 60.0, "y_min": 40.0, "x_max": 500.0, "y_max": 480.0},
                "detection_type": "wildlife"
            })
        
        else:
            # Strategy 2: Use file content hash for deterministic results
            file_hash = 0
            if image_path and os.path.exists(image_path):
                try:
                    with open(image_path, 'rb') as f:
                        data = f.read(8192)  # Read first 8KB
                        file_hash = int(hashlib.md5(data).hexdigest(), 16)
                except:
                    file_hash = hash(image_path)
            else:
                file_hash = hash(str(image_path) + str(original_filename))
            
            # Seed RNG with file hash for deterministic results
            rng = np.random.RandomState(file_hash % (2**31))
            
            all_classes = {**self.WILDLIFE_CLASSES, **self.THREAT_CLASSES}
            # Bias toward threats (60% chance) for more useful demo results
            if rng.random() < 0.6:
                class_id = rng.choice(list(self.THREAT_CLASSES.keys()))
            else:
                class_id = rng.choice(list(self.WILDLIFE_CLASSES.keys()))
            
            detections_list.append({
                "class_id": int(class_id),
                "class_name": all_classes[class_id],
                "confidence": float(rng.uniform(0.75, 0.95)),
                "bbox": {
                    "x_min": float(rng.uniform(50, 200)),
                    "y_min": float(rng.uniform(50, 200)),
                    "x_max": float(rng.uniform(350, 550)),
                    "y_max": float(rng.uniform(350, 550))
                },
                "detection_type": "threat" if class_id >= 8 else "wildlife"
            })
        
        return {
            "image_path": image_path,
            "timestamp": datetime.now().isoformat(),
            "model": "yolov5_small",
            "detections": detections_list,
            "num_detections": len(detections_list),
            "inference_time_ms": float(np.random.uniform(100, 150))
        }
    
    def batch_predict(self, image_paths: List[str]) -> List[Dict]:
        """
        Perform detection on multiple images.
        
        Parameters:
        -----------
        image_paths : list
            List of image file paths
            
        Returns:
        --------
        results : list
            List of detection results
        """
        results = []
        for image_path in image_paths:
            result = self.predict(image_path)
            results.append(result)
        return results
    
    def process_detection_result(self, detection_result: Dict) -> Dict:
        """
        Process detection result for MongoDB storage and alerting.
        
        Parameters:
        -----------
        detection_result : dict
            Raw detection output from model
            
        Returns:
        --------
        processed : dict
            Processed result ready for database
        """
        processed = {
            "timestamp": datetime.now().isoformat(),
            "image_path": detection_result["image_path"],
            "model": detection_result["model"],
            "inference_time_ms": detection_result["inference_time_ms"],
            "wildlife_detections": [],
            "threat_detections": [],
            "alert_generated": False,
            "alert_level": "none"
        }
        
        # Separate wildlife and threat detections
        for detection in detection_result["detections"]:
            if detection["detection_type"] == "threat":
                processed["threat_detections"].append({
                    "class": detection["class_name"],
                    "confidence": detection["confidence"],
                    "bbox": detection["bbox"]
                })
                # Generate alert for threats
                if detection["confidence"] >= 0.7:
                    processed["alert_generated"] = True
                    processed["alert_level"] = "HIGH" if detection["confidence"] >= 0.85 else "MEDIUM"
            else:
                processed["wildlife_detections"].append({
                    "species": detection["class_name"],
                    "confidence": detection["confidence"],
                    "bbox": detection["bbox"]
                })
        
        return processed


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    """
    Example usage of ImageDetector
    """
    print("\n" + "="*70)
    print("IMAGE DETECTOR - PRODUCTION ML SERVICE")
    print("="*70)
    
    detector = ImageDetector()
    
    # Example image paths (from camera traps)
    test_images = [
        "/path/to/camera_trap_1.jpg",
        "/path/to/camera_trap_2.jpg",
        "/path/to/camera_trap_3.jpg"
    ]
    
    print(f"\n✓ Initialized detector using {detector.model_path}")
    print(f"✓ Confidence threshold: {detector.confidence_threshold}")
    print(f"✓ Wildlife classes: {len(detector.WILDLIFE_CLASSES)}")
    print(f"✓ Threat classes: {len(detector.THREAT_CLASSES)}")
    
    print("\n" + "="*70)
    print("PROCESSING SAMPLE IMAGES")
    print("="*70)
    
    # Process sample images
    for image_path in test_images:
        result = detector.predict(image_path)
        processed = detector.process_detection_result(result)
        
        print(f"\n📷 Image: {os.path.basename(image_path)}")
        print(f"   Wildlife detected: {len(processed['wildlife_detections'])}")
        print(f"   Threats detected: {len(processed['threat_detections'])}")
        print(f"   Alert generated: {'🚨 YES' if processed['alert_generated'] else '✓ No'}")
        
        if processed['wildlife_detections']:
            print("   Species found:")
            for detection in processed['wildlife_detections']:
                print(f"     - {detection['species']} ({detection['confidence']:.2%})")
        
        if processed['threat_detections']:
            print("   Threats found:")
            for detection in processed['threat_detections']:
                print(f"     - {detection['class']} ({detection['confidence']:.2%})")
