"""
Automatic Detection Generator
=============================
Background task that generates realistic detection events periodically.
This simulates a real camera trap system continuously capturing data.

Uses raw pymongo instead of MongoEngine to avoid thread-local issues.
"""

import os
import random
import threading
import time
import logging
import shutil
import re
from datetime import datetime
from pathlib import Path
from bson import ObjectId

logger = logging.getLogger('wildguard.detection_generator')

# Generator state
_generator_thread = None
_stop_event = threading.Event()


def get_dataset_paths():
    """Get paths to dataset images and audio files."""
    base_path = Path(__file__).parent.parent / "ml_experiments" / "datasets"
    
    return {
        'animal_images': list((base_path / "images" / "animal").glob("*.jpg")),
        'human_images': list((base_path / "images" / "human").glob("*.jpg")),
        'gunshot_audio': list((base_path / "audio" / "gunshot").glob("*.wav")),
        'human_audio': list((base_path / "audio" / "human").glob("*.wav")),
    }


def copy_media_file(source_path, media_root):
    """Copy file to media directory and return URL."""
    media_dir = Path(media_root) / "detections"
    os.makedirs(media_dir, exist_ok=True)
    
    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', source_path.name)
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{random.randint(1000,9999)}_{safe_name}"
    dest_path = media_dir / filename
    
    try:
        shutil.copy2(source_path, dest_path)
        return f"http://localhost:8000/media/detections/{filename}"
    except Exception as e:
        logger.error(f"Failed to copy media file: {e}")
        return None


def generate_detection_with_pymongo(db, media_root, force_audio=False):
    """Generate a single detection using raw pymongo.
    
    Args:
        db: MongoDB database instance
        media_root: Path to media directory
        force_audio: If True, always generate audio detection (gunshot/human)
    """
    # Get cameras
    cameras = list(db.camera_traps.find({'is_active': True}))
    if not cameras:
        logger.warning("No cameras found")
        return None
    
    camera = random.choice(cameras)
    datasets = get_dataset_paths()
    
    # Force audio if requested, otherwise use weighted random selection
    if force_audio:
        detection_type = 'audio'
    else:
        # Weighted selection: 50% animal, 25% human, 15% audio, 10% fused
        detection_type = random.choices(
            ['animal', 'human', 'audio', 'fused'],
            weights=[50, 25, 15, 10],
            k=1
        )[0]
    
    detection_doc = {
        '_id': ObjectId(),
        'camera_trap': camera['_id'],
        'created_at': datetime.now(),
    }
    
    if detection_type == 'animal' and datasets['animal_images']:
        img = random.choice(datasets['animal_images'])
        animal_types = ['bear', 'deer', 'elephant', 'fox', 'leopard', 'lion', 'monkey', 'tiger']
        
        detected_animal = 'wildlife'
        for animal in animal_types:
            if animal in img.name.lower():
                detected_animal = animal
                break
        
        img_url = copy_media_file(img, media_root)
        
        detection_doc.update({
            'detection_type': 'image',
            'detected_object': detected_animal,
            'confidence': random.uniform(0.75, 0.98),
            'alert_level': random.choice(['low', 'low', 'medium']),
            'image_url': img_url
        })
        
    elif detection_type == 'human' and datasets['human_images']:
        img = random.choice(datasets['human_images'])
        img_url = copy_media_file(img, media_root)
        is_suspicious = random.random() > 0.6
        
        detection_doc.update({
            'detection_type': 'image',
            'detected_object': 'human',
            'confidence': random.uniform(0.80, 0.95),
            'alert_level': 'high' if is_suspicious else 'medium',
            'image_url': img_url
        })
        
        # Create emergency alert for suspicious activity
        if is_suspicious:
            alert_type = random.choice(['armed_person', 'vehicle_in_restricted_zone'])
            alert_doc = {
                '_id': ObjectId(),
                'alert_type': alert_type,
                'description': f"Suspicious activity detected at {camera.get('name', 'Unknown')}",
                'detection': detection_doc['_id'],
                'camera_trap': camera['_id'],
                'location': camera.get('location', ''),
                'severity': random.choice(['high', 'critical']),
                'is_resolved': False,
                'created_at': datetime.now()
            }
            db.detections.insert_one(detection_doc)
            db.emergency_alerts.insert_one(alert_doc)
            print(f"[Generator] Created alert: {alert_type} at {camera.get('name')}")
            return detection_doc
            
    elif detection_type == 'audio':
        if random.random() > 0.5 and datasets['gunshot_audio']:
            audio = random.choice(datasets['gunshot_audio'])
            audio_url = copy_media_file(audio, media_root)
            
            detection_doc.update({
                'detection_type': 'audio',
                'detected_object': 'gunshot',
                'confidence': random.uniform(0.85, 0.98),
                'alert_level': 'critical',
                'audio_url': audio_url
            })
            
            alert_doc = {
                '_id': ObjectId(),
                'alert_type': 'gunshot',
                'description': f"Gunshot detected at {camera.get('name', 'Unknown')} - immediate response required",
                'detection': detection_doc['_id'],
                'camera_trap': camera['_id'],
                'location': camera.get('location', ''),
                'severity': 'critical',
                'is_resolved': False,
                'created_at': datetime.now()
            }
            db.detections.insert_one(detection_doc)
            db.emergency_alerts.insert_one(alert_doc)
            print(f"[Generator] Created gunshot alert at {camera.get('name')}")
            return detection_doc
            
        elif datasets['human_audio']:
            audio = random.choice(datasets['human_audio'])
            audio_url = copy_media_file(audio, media_root)
            
            detection_doc.update({
                'detection_type': 'audio',
                'detected_object': 'human_activity',
                'confidence': random.uniform(0.70, 0.90),
                'alert_level': 'medium',
                'audio_url': audio_url
            })
    
    if 'detection_type' in detection_doc:
        db.detections.insert_one(detection_doc)
        print(f"[Generator] Created detection: {detection_doc.get('detected_object')} at {camera.get('name')}")
        return detection_doc
    
    return None


def generate_fused_detection(db, media_root):
    """Generate a fused detection combining both image + audio evidence.
    
    Uses LateFusionEngine to combine visual and audio confidence scores
    into a single, higher-confidence prediction.
    
    Picks coherent image+audio pairs from realistic scenarios:
    - Human image + gunshot audio  → armed poacher (critical)
    - Human image + human audio    → trespasser with voice activity (high)
    - Animal image + gunshot audio  → poaching near wildlife (critical)
    """
    from ml_services.late_fusion import LateFusionEngine
    
    cameras = list(db.camera_traps.find({'is_active': True}))
    if not cameras:
        return None
    
    camera = random.choice(cameras)
    datasets = get_dataset_paths()
    
    # Define coherent fusion scenarios (image_source, audio_source, visual_label, audio_label)
    scenarios = []
    
    if datasets['human_images'] and datasets['gunshot_audio']:
        # Scenario: Camera sees human + mic picks up gunshot → armed poacher
        scenarios.append({
            'image_pool': datasets['human_images'],
            'audio_pool': datasets['gunshot_audio'],
            'visual_object': 'human',
            'audio_class': 'gunshot',
        })
    
    if datasets['animal_images'] and datasets['gunshot_audio']:
        # Scenario: Camera sees wildlife + mic picks up gunshot → poaching near wildlife
        scenarios.append({
            'image_pool': datasets['animal_images'],
            'audio_pool': datasets['gunshot_audio'],
            'visual_object': None,  # Will be determined from image filename
            'audio_class': 'gunshot',
        })
    
    if not scenarios:
        logger.warning("Need matching image+audio datasets for fused detection")
        return None
    
    # Pick a random coherent scenario
    scenario = random.choice(scenarios)
    
    img = random.choice(scenario['image_pool'])
    audio = random.choice(scenario['audio_pool'])
    
    img_url = copy_media_file(img, media_root)
    audio_url = copy_media_file(audio, media_root)
    
    # Determine visual object from the scenario or image filename
    visual_object = scenario['visual_object']
    if visual_object is None:
        animal_types = ['bear', 'deer', 'elephant', 'fox', 'leopard', 'lion', 'monkey', 'tiger']
        visual_object = 'wildlife'
        for animal in animal_types:
            if animal in img.name.lower():
                visual_object = animal
                break
    
    audio_class = scenario['audio_class']
    
    # Simulate individual detector confidence scores
    visual_conf = random.uniform(0.70, 0.95)
    audio_conf = random.uniform(0.65, 0.95)
    
    # Run late fusion
    engine = LateFusionEngine()
    fused_result = engine.fuse(
        visual_result={'confidence': visual_conf, 'detected_object': visual_object},
        audio_result={'confidence': audio_conf, 'predicted_class': audio_class}
    )
    
    detection_doc = {
        '_id': ObjectId(),
        'camera_trap': camera['_id'],
        'created_at': datetime.now(),
        'detection_type': 'fused',
        'detected_object': fused_result['detected_object'],
        'confidence': fused_result['fusion_confidence'],
        'alert_level': fused_result['alert_level'],
        'image_url': img_url,
        'audio_url': audio_url,
        # Late fusion fields
        'visual_confidence': fused_result['visual_confidence'],
        'audio_confidence': fused_result['audio_confidence'],
        'fusion_confidence': fused_result['fusion_confidence'],
        'fusion_method': fused_result['fusion_method'],
    }
    
    db.detections.insert_one(detection_doc)
    
    # Create emergency alert if escalation was applied
    if fused_result.get('escalation_applied'):
        alert_doc = {
            '_id': ObjectId(),
            'alert_type': 'armed_person' if 'poacher' in fused_result['detected_object'] else 'gunshot',
            'description': (
                f"FUSED ALERT: {fused_result['detected_object']} detected at "
                f"{camera.get('name', 'Unknown')} "
                f"(visual={visual_conf:.0%} + audio={audio_conf:.0%} → fused={fused_result['fusion_confidence']:.0%})"
            ),
            'detection': detection_doc['_id'],
            'camera_trap': camera['_id'],
            'location': camera.get('location', ''),
            'severity': fused_result['alert_level'],
            'is_resolved': False,
            'created_at': datetime.now()
        }
        db.emergency_alerts.insert_one(alert_doc)
        print(f"[Generator] Created FUSED alert: {fused_result['detected_object']} at {camera.get('name')} (escalation: {fused_result['escalation_rule']})")
    else:
        print(f"[Generator] Created FUSED detection: {fused_result['detected_object']} at {camera.get('name')} (visual={visual_object}, audio={audio_class}, conf={fused_result['fusion_confidence']:.0%})")
    
    return detection_doc


def detection_generator_loop():
    """Main loop for generating detections periodically."""
    print("[Generator] Detection generator started")
    
    # Wait for server to initialize
    time.sleep(5)
    
    # Create dedicated pymongo connection for this thread
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        
        mongo_host = getattr(settings, 'MONGO_HOST', None)
        mongo_db = getattr(settings, 'MONGO_DB', 'Wildguard')
        media_root = getattr(settings, 'MEDIA_ROOT', '')
        
        if not mongo_host:
            print("[Generator] ERROR: No MongoDB host configured")
            return
        
        # Create new client for this thread
        client = MongoClient(mongo_host, tlsCAFile=certifi.where())
        db = client[mongo_db]
        
        print("[Generator] MongoDB connection established")
        
    except Exception as e:
        print(f"[Generator] Failed to connect to MongoDB: {e}")
        return
    
    while not _stop_event.is_set():
        try:
            # Generate 1-3 random detections (image or audio)
            num_detections = random.randint(1, 3)
            for _ in range(num_detections):
                generate_detection_with_pymongo(db, media_root)
            
            # Generate a fused detection (image + audio combined)
            generate_fused_detection(db, media_root)
            
            # Always generate at least one critical audio detection (gunshot or human)
            # This ensures we have critical alerts every day
            generate_detection_with_pymongo(db, media_root, force_audio=True)
            
            # Wait 2-5 minutes before next batch
            wait_time = random.randint(120, 300)
            print(f"[Generator] Next batch in {wait_time // 60}m {wait_time % 60}s")
            
            _stop_event.wait(timeout=wait_time)
            
        except Exception as e:
            print(f"[Generator] Error: {e}")
            import traceback
            traceback.print_exc()
            time.sleep(30)
    
    # Cleanup
    client.close()
    print("[Generator] Stopped")


def start_generator():
    """Start the background detection generator."""
    global _generator_thread
    
    if _generator_thread is not None and _generator_thread.is_alive():
        print("[Generator] Already running")
        return
    
    _stop_event.clear()
    _generator_thread = threading.Thread(
        target=detection_generator_loop,
        name="DetectionGenerator",
        daemon=True
    )
    _generator_thread.start()
    print("[Generator] Thread started")


def stop_generator():
    """Stop the background detection generator."""
    global _generator_thread
    
    if _generator_thread is None:
        return
    
    _stop_event.set()
    _generator_thread.join(timeout=5)
    _generator_thread = None
    print("[Generator] Stopped")


def is_running():
    """Check if generator is running."""
    return _generator_thread is not None and _generator_thread.is_alive()
