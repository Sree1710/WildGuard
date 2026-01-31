"""
Generate Sample Detections from Dataset
========================================
This script creates Detection records in the database based on the 
image dataset, so the admin dashboard shows real data.

Run this after:
1. init_sample_data.py (creates users, species, cameras)
2. image model training (creates trained model)

Usage:
    python generate_detections.py
"""

import os
import sys
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from detection.models import Detection, CameraTrap, EmergencyAlert


def generate_detections():
    """Generate detection records from the image dataset."""
    print("\n" + "=" * 70)
    print("🔄 GENERATING SAMPLE DETECTIONS FROM DATASET")
    print("=" * 70)
    
    # Check if cameras exist
    cameras = list(CameraTrap.objects.all())
    if not cameras:
        print("❌ No cameras found. Run init_sample_data.py first.")
        return
    
    print(f"✓ Found {len(cameras)} cameras")
    
    # Dataset path
    dataset_path = Path(__file__).parent / "ml_experiments" / "datasets" / "images"
    if not dataset_path.exists():
        dataset_path = Path(__file__).parent / "datasets" / "images"
    
    if not dataset_path.exists():
        print(f"❌ Dataset not found at {dataset_path}")
        return
    
    # Count images
    animal_images = list((dataset_path / "animal").glob("*.jpg")) + list((dataset_path / "animal").glob("*.png"))
    human_images = list((dataset_path / "human").glob("*.jpg")) + list((dataset_path / "human").glob("*.png"))
    
    print(f"  Animal images: {len(animal_images)}")
    print(f"  Human images: {len(human_images)}")
    
    # Setup media directory
    from django.conf import settings
    import shutil
    
    media_detections_dir = Path(settings.MEDIA_ROOT) / "detections"
    os.makedirs(media_detections_dir, exist_ok=True)
    print(f"  Media directory: {media_detections_dir}")
    
    import re

    def copy_image_to_media(image_path):
        """Copy image to media dir and return URL."""
        # Sanitize filename
        safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', os.path.basename(image_path))
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{safe_name}"
        dest_path = media_detections_dir / filename
        shutil.copy2(image_path, dest_path)
        return f"http://localhost:8000/media/detections/{filename}"
    
    # Clear existing detections (optional)
    existing_count = Detection.objects.count()
    if existing_count > 0:
        print(f"\n⚠ Found {existing_count} existing detections.")
        # Auto-delete for clean slate
        Detection.objects.delete()
        print("  ✓ Deleted existing detections")
    
    # Generate detections over the past 7 days
    detections_created = 0
    alerts_created = 0
    
    print("\n  Creating detections...")
    
    # Animal detections
    # Only use species we have images for to ensure accuracy
    animal_types = ['bear', 'deer', 'elephant', 'fox', 'leopard', 'lion', 'monkey', 'tiger']
    
    for i, img in enumerate(animal_images[:50]):  # Limit to 50
        camera = random.choice(cameras)
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        detection_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        # Extract label from filename
        filename = img.name.lower()
        detected_animal = None
        
        for animal in animal_types:
            if animal in filename:
                detected_animal = animal
                break
        
        # If we can't identify the animal from the filename, mark as generic
        if not detected_animal:
            detected_animal = 'unidentified_animal'

        confidence = random.uniform(0.75, 0.98)
        img_url = copy_image_to_media(img)
        
        detection = Detection(
            camera_trap=camera,
            detection_type='image',
            detected_object=detected_animal,
            confidence=confidence,
            alert_level=random.choice(['low', 'low', 'medium']),
            created_at=detection_time,
            image_url=img_url
        )
        detection.save()
        detections_created += 1

    # Human detections (some as alerts)
    for i, img in enumerate(human_images[:30]):  # Limit to 30
        camera = random.choice(cameras)
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        detection_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        confidence = random.uniform(0.80, 0.95)
        is_suspicious = random.random() > 0.5
        img_url = copy_image_to_media(img)
        
        detection = Detection(
            camera_trap=camera,
            detection_type='image',
            detected_object='human',
            confidence=confidence,
            alert_level='high' if is_suspicious else 'medium',
            created_at=detection_time,
            image_url=img_url
        )
        detection.save()
        detections_created += 1
        
        # Create emergency alert for suspicious activity
        if is_suspicious:
            alert_type = 'armed_person' if random.random() > 0.5 else 'vehicle_in_restricted_zone'
            descriptions = {
                'armed_person': f'Suspicious person detected at {camera.name}',
                'vehicle_in_restricted_zone': f'Unauthorized vehicle spotted near {camera.name}'
            }
            alert = EmergencyAlert(
                alert_type=alert_type,
                description=descriptions[alert_type],
                detection=detection,
                camera_trap=camera,
                location=camera.location,
                severity=random.choice(['high', 'critical']),
                is_resolved=random.random() > 0.3,
                created_at=detection_time
            )
            if alert.is_resolved:
                alert.resolved_at = detection_time + timedelta(hours=random.randint(1, 4))
            alert.save()
            alerts_created += 1
    
    # Add some gunshot detections (audio)
    # Audio datasets
    gunshot_audio = list((dataset_path.parent / "audio" / "gunshot").glob("*.wav"))
    human_audio = list((dataset_path.parent / "audio" / "human").glob("*.wav"))
    
    # Fallback if no audio files found
    if not gunshot_audio and not human_audio:
        print("⚠ No audio files found. Using dummy URL.")
    
    def copy_audio_to_media(audio_path):
        """Copy audio to media dir and return URL."""
        if not audio_path or not audio_path.exists():
            return None
            
        # Sanitize filename
        safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', os.path.basename(audio_path))
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{safe_name}"
        dest_path = media_detections_dir / filename
        shutil.copy2(audio_path, dest_path)
        return f"http://localhost:8000/media/detections/{filename}"

    # Gunshot detections
    for i in range(10):
        camera = random.choice(cameras)
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        detection_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        # Select audio file
        audio_file = random.choice(gunshot_audio) if gunshot_audio else None
        audio_url = copy_audio_to_media(audio_file)
        
        detection = Detection(
            camera_trap=camera,
            detection_type='audio',
            detected_object='gunshot',
            confidence=random.uniform(0.85, 0.98),
            alert_level='critical',
            created_at=detection_time,
            audio_url=audio_url
        )
        detection.save()
        detections_created += 1
        
        # Create critical emergency alert
        alert = EmergencyAlert(
            alert_type='gunshot',
            description=f'Gunshot detected at {camera.name} - immediate response required',
            detection=detection,
            camera_trap=camera,
            location=camera.location,
            severity='critical',
            is_resolved=random.random() > 0.7,
            created_at=detection_time
        )
        if alert.is_resolved:
            alert.resolved_at = detection_time + timedelta(hours=random.randint(1, 2))
        alert.save()
        alerts_created += 1
        
    # Human audio detections (voices, footsteps)
    for i in range(15):
        camera = random.choice(cameras)
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        detection_time = datetime.now() - timedelta(days=days_ago, hours=hours_ago)
        
        audio_file = random.choice(human_audio) if human_audio else None
        audio_url = copy_audio_to_media(audio_file)
        
        detection = Detection(
            camera_trap=camera,
            detection_type='audio',
            detected_object='human_activity', # Distinguish from visual 'human'
            confidence=random.uniform(0.70, 0.90),
            alert_level='high',
            created_at=detection_time,
            audio_url=audio_url
        )
        detection.save()
        detections_created += 1

    print(f"\n✓ Created {detections_created} detections")
    print(f"✓ Created {alerts_created} emergency alerts")
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 DASHBOARD DATA SUMMARY")
    print("=" * 70)
    
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    total_detections = Detection.objects.count()
    detections_today = Detection.objects(created_at__gte=today).count()
    animals_today = Detection.objects(
        created_at__gte=today,
        detected_object__nin=['human', 'person', 'chainsaw', 'gunshot', 'vehicle']
    ).count()
    humans_today = Detection.objects(
        created_at__gte=today,
        detected_object__in=['human', 'person']
    ).count()
    unresolved_alerts = EmergencyAlert.objects(is_resolved=False).count()
    
    print(f"  Total Detections: {total_detections}")
    print(f"  Detections Today: {detections_today}")
    print(f"  Animals Today: {animals_today}")
    print(f"  Humans Today: {humans_today}")
    print(f"  Unresolved Alerts: {unresolved_alerts}")
    
    print("\n✅ Dashboard should now show real data!")
    print("   Refresh the admin dashboard to see the updates.")


if __name__ == "__main__":
    generate_detections()
