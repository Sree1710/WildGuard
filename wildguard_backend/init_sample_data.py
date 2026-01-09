"""
Sample Data Initialization
===========================
Create sample data for testing and demonstration.

Run this after server startup to populate the database.
"""

from detection.models import User, Species, CameraTrap
import hashlib
from datetime import datetime

def create_sample_users():
    """Create sample users for testing."""
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@wildguard.org',
            'password': 'admin123',
            'full_name': 'Admin User',
            'role': 'admin'
        },
        {
            'username': 'ranger1',
            'email': 'ranger1@wildguard.org',
            'password': 'ranger123',
            'full_name': 'John Ranger',
            'role': 'user'
        },
        {
            'username': 'ranger2',
            'email': 'ranger2@wildguard.org',
            'password': 'ranger123',
            'full_name': 'Jane Ranger',
            'role': 'user'
        }
    ]
    
    for user_data in users_data:
        try:
            # Check if user exists
            User.objects.get(username=user_data['username'])
            print(f"✓ User {user_data['username']} already exists")
        except User.DoesNotExist:
            password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
            user = User(
                username=user_data['username'],
                email=user_data['email'],
                password_hash=password_hash,
                full_name=user_data['full_name'],
                role=user_data['role'],
                is_active=True
            )
            user.save()
            print(f"✓ Created user: {user_data['username']}")


def create_sample_species():
    """Create sample wildlife species."""
    species_data = [
        {
            'name': 'African Elephant',
            'scientific_name': 'Loxodonta africana',
            'conservation_status': 'Vulnerable',
            'habitat': 'Savanna, forest',
            'description': "World's largest land animal",
            'average_weight_kg': 6000,
            'average_height_m': 4.0,
            'identification_features': ['long_tusks', 'grey_skin', 'large_ears'],
            'is_endangered': True,
            'poaching_risk_level': 'high'
        },
        {
            'name': 'Black Rhino',
            'scientific_name': 'Diceros bicornis',
            'conservation_status': 'Critically Endangered',
            'habitat': 'Savanna, grassland',
            'description': 'Critically endangered species',
            'average_weight_kg': 1360,
            'average_height_m': 1.5,
            'identification_features': ['two_horns', 'black_skin'],
            'is_endangered': True,
            'poaching_risk_level': 'high'
        },
        {
            'name': 'African Lion',
            'scientific_name': 'Panthera leo',
            'conservation_status': 'Vulnerable',
            'habitat': 'Savanna, grassland',
            'description': 'Apex predator and symbol of Africa',
            'average_weight_kg': 190,
            'average_height_m': 1.2,
            'identification_features': ['mane', 'roar', 'golden_fur'],
            'is_endangered': False,
            'poaching_risk_level': 'medium'
        },
        {
            'name': 'Plains Zebra',
            'scientific_name': 'Equus quagga',
            'conservation_status': 'Least Concern',
            'habitat': 'Grassland, savanna',
            'description': 'Iconic striped herbivore',
            'average_weight_kg': 350,
            'average_height_m': 1.3,
            'identification_features': ['stripes', 'short_mane'],
            'is_endangered': False,
            'poaching_risk_level': 'low'
        },
        {
            'name': 'African Buffalo',
            'scientific_name': 'Syncerus caffer',
            'conservation_status': 'Least Concern',
            'habitat': 'Savanna, grassland, forest',
            'description': 'Powerful herd animal',
            'average_weight_kg': 900,
            'average_height_m': 1.6,
            'identification_features': ['horns', 'dark_fur', 'herd_behavior'],
            'is_endangered': False,
            'poaching_risk_level': 'low'
        }
    ]
    
    for species in species_data:
        try:
            Species.objects.get(name=species['name'])
            print(f"✓ Species {species['name']} already exists")
        except Species.DoesNotExist:
            new_species = Species(**species)
            new_species.save()
            print(f"✓ Created species: {species['name']}")


def create_sample_cameras():
    """Create sample camera trap deployments."""
    cameras_data = [
        {
            'name': 'CT-001',
            'location': 'Waterhole North',
            'latitude': -1.2345,
            'longitude': 35.6789,
            'altitude_m': 1200,
            'resolution': '1920x1080',
            'battery_level': 87,
            'storage_available_gb': 256,
            'is_active': True,
            'is_online': True
        },
        {
            'name': 'CT-002',
            'location': 'Waterhole South',
            'latitude': -1.3456,
            'longitude': 35.7890,
            'altitude_m': 1150,
            'resolution': '1920x1080',
            'battery_level': 92,
            'storage_available_gb': 512,
            'is_active': True,
            'is_online': True
        },
        {
            'name': 'CT-003',
            'location': 'Forest Ridge East',
            'latitude': -1.1234,
            'longitude': 35.8901,
            'altitude_m': 1450,
            'resolution': '1920x1080',
            'battery_level': 45,
            'storage_available_gb': 128,
            'is_active': True,
            'is_online': False
        },
        {
            'name': 'CT-004',
            'location': 'Valley Trail West',
            'latitude': -1.4567,
            'longitude': 35.5678,
            'altitude_m': 1000,
            'resolution': '1920x1080',
            'battery_level': 100,
            'storage_available_gb': 256,
            'is_active': True,
            'is_online': True
        },
        {
            'name': 'CT-005',
            'location': 'Mountain Pass',
            'latitude': -1.0123,
            'longitude': 35.9012,
            'altitude_m': 1800,
            'resolution': '1920x1080',
            'battery_level': 78,
            'storage_available_gb': 256,
            'is_active': True,
            'is_online': True
        }
    ]
    
    for camera_data in cameras_data:
        try:
            CameraTrap.objects.get(name=camera_data['name'])
            print(f"✓ Camera {camera_data['name']} already exists")
        except CameraTrap.DoesNotExist:
            camera = CameraTrap(**camera_data)
            camera.save()
            print(f"✓ Created camera: {camera_data['name']}")


def initialize_sample_data():
    """Initialize all sample data."""
    print("\n" + "="*70)
    print("INITIALIZING SAMPLE DATA")
    print("="*70)
    
    print("\\n[1/3] Creating users...")
    create_sample_users()
    
    print("\\n[2/3] Creating species...")
    create_sample_species()
    
    print("\\n[3/3] Creating cameras...")
    create_sample_cameras()
    
    print("\\n" + "="*70)
    print("✅ SAMPLE DATA INITIALIZATION COMPLETE")
    print("="*70)
    print("\\nYou can now login with:")
    print("  Username: admin / Password: admin123 (Admin)")
    print("  Username: ranger1 / Password: ranger123 (Field staff)")
    print("  Username: ranger2 / Password: ranger123 (Field staff)")


if __name__ == "__main__":
    initialize_sample_data()
