"""
DJANGO MODELS - MONGOENGINE
=============================
WildGuard database models using MongoDB with mongoengine.

Models:
- User (custom user model with roles)
- Species
- CameraTrap
- Detection (image and audio)
- EmergencyAlert
- Activity Log
- Detection Evidence
"""

from mongoengine import (
    Document, StringField, IntField, FloatField, BooleanField,
    DateTimeField, ListField, DictField, ReferenceField, EmbeddedDocument,
    EmbeddedDocumentField, URLField, FileField, ObjectIdField
)
from datetime import datetime
import uuid

# ============================================================================
# EMBEDDED DOCUMENTS
# ============================================================================

class BoundingBox(EmbeddedDocument):
    """
    Bounding box for detected objects in images.
    """
    x_min = FloatField(required=True)  # 0-1 normalized coordinate
    y_min = FloatField(required=True)
    x_max = FloatField(required=True)
    y_max = FloatField(required=True)
    
    def to_dict(self):
        return {
            'x_min': self.x_min,
            'y_min': self.y_min,
            'x_max': self.x_max,
            'y_max': self.y_max
        }


class ObjectDetection(EmbeddedDocument):
    """
    Detected object within an image.
    """
    object_type = StringField(required=True)  # e.g., "elephant", "human"
    confidence = FloatField(required=True, min_value=0, max_value=1)
    bbox = EmbeddedDocumentField(BoundingBox)
    
    def to_dict(self):
        return {
            'object_type': self.object_type,
            'confidence': self.confidence,
            'bbox': self.bbox.to_dict() if self.bbox else None
        }


class AudioProbability(EmbeddedDocument):
    """
    Audio classification probabilities.
    """
    class_name = StringField(required=True)  # e.g., "elephant", "chainsaw"
    probability = FloatField(required=True, min_value=0, max_value=1)
    
    def to_dict(self):
        return {
            'class_name': self.class_name,
            'probability': self.probability
        }


# ============================================================================
# CORE MODELS
# ============================================================================

class User(Document):
    """
    Custom user model with role-based access control.
    """
    # Basic info
    username = StringField(required=True, unique=True)
    email = StringField(required=True, unique=True)
    password_hash = StringField(required=True)  # Never store plaintext!
    
    # Profile
    full_name = StringField()
    avatar_url = URLField()
    
    # Role and permissions
    role = StringField(
        required=True,
        choices=['admin', 'user'],
        default='user'
    )
    is_active = BooleanField(default=True)
    
    # Assigned camera traps (for field staff)
    assigned_cameras = ListField(ReferenceField('CameraTrap'))
    
    # Metadata
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    last_login = DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': ['username', 'email', 'role']
    }
    
    def to_dict(self, include_sensitive=False):
        """Convert to dictionary for API response."""
        data = {
            'id': str(self.id),
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        if include_sensitive:
            data['assigned_cameras'] = [str(cam.id) for cam in self.assigned_cameras]
        return data


class Species(Document):
    """
    Wildlife species in the conservation area.
    """
    name = StringField(required=True, unique=True)  # e.g., "African Elephant"
    scientific_name = StringField()  # e.g., "Loxodonta africana"
    conservation_status = StringField(
        choices=['Extinct', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern'],
        default='Least Concern'
    )
    description = StringField()
    habitat = StringField()  # e.g., "Savanna, forest"
    
    # Identification info
    average_weight_kg = FloatField()
    average_height_m = FloatField()
    identification_features = ListField(StringField())  # e.g., ["long tusks", "grey color"]
    
    # Image for reference
    reference_image_url = URLField()
    
    # Threat level (for priority alerts)
    is_endangered = BooleanField(default=False)
    poaching_risk_level = StringField(
        choices=['low', 'medium', 'high'],
        default='low'
    )
    
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'species',
        'indexes': ['name', 'conservation_status']
    }
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'scientific_name': self.scientific_name,
            'conservation_status': self.conservation_status,
            'description': self.description,
            'habitat': self.habitat,
            'average_weight_kg': self.average_weight_kg,
            'average_height_m': self.average_height_m,
            'identification_features': self.identification_features,
            'is_endangered': self.is_endangered,
            'poaching_risk_level': self.poaching_risk_level,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CameraTrap(Document):
    """
    Camera trap device deployed in the field.
    """
    name = StringField(required=True)  # e.g., "CT-001"
    location = StringField(required=True)  # e.g., "Waterhole North"
    
    # GPS coordinates
    latitude = FloatField(required=True)
    longitude = FloatField(required=True)
    altitude_m = FloatField()  # Above sea level
    
    # Status
    is_active = BooleanField(default=True)
    is_online = BooleanField(default=False)
    
    # Camera specs
    resolution = StringField()  # e.g., "1920x1080"
    battery_level = IntField(min_value=0, max_value=100)
    storage_available_gb = FloatField()
    
    # Assignment
    assigned_ranger = ReferenceField(User)  # Field staff responsible
    
    # Last activity
    last_detection_at = DateTimeField()
    last_sync_at = DateTimeField()
    
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'camera_traps',
        'indexes': ['name', 'is_active', 'is_online', 'location']
    }
    
    def to_dict(self, include_ranger=False):
        data = {
            'id': str(self.id),
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'altitude_m': self.altitude_m,
            'is_active': self.is_active,
            'is_online': self.is_online,
            'resolution': self.resolution,
            'battery_level': self.battery_level,
            'storage_available_gb': self.storage_available_gb,
            'last_detection_at': self.last_detection_at.isoformat() if self.last_detection_at else None,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_ranger and self.assigned_ranger:
            data['assigned_ranger'] = str(self.assigned_ranger.id)
        return data


class Detection(Document):
    """
    Detection event (image-based or audio-based).
    """
    # Reference
    camera_trap = ReferenceField(CameraTrap, required=True)
    
    # Detection type
    detection_type = StringField(
        required=True,
        choices=['image', 'audio'],
        default='image'
    )
    
    # Classification
    detected_object = StringField(required=True)  # e.g., "elephant", "chainsaw"
    confidence = FloatField(required=True, min_value=0, max_value=1)
    alert_level = StringField(
        choices=['none', 'low', 'medium', 'high', 'critical'],
        default='none'
    )
    
    # Image-specific (if detection_type == 'image')
    image_url = URLField()
    objects_detected = ListField(EmbeddedDocumentField(ObjectDetection))
    
    # Audio-specific (if detection_type == 'audio')
    audio_url = URLField()
    audio_classification_probabilities = ListField(EmbeddedDocumentField(AudioProbability))
    
    # Metadata
    inference_time_ms = FloatField()  # Model inference time
    species_suspected = ReferenceField(Species)  # If known
    
    # Processing
    is_verified = BooleanField(default=False)
    verified_by = ReferenceField(User)  # Admin who verified
    false_positive = BooleanField(default=False)
    
    # Notes
    notes = StringField()
    
    created_at = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'detections',
        'indexes': ['camera_trap', 'detected_object', 'alert_level', 'created_at'],
        'ordering': ['-created_at']
    }
    
    def to_dict(self, include_evidence=False):
        data = {
            'id': str(self.id),
            'camera_trap_id': str(self.camera_trap.id),
            'detection_type': self.detection_type,
            'detected_object': self.detected_object,
            'confidence': self.confidence,
            'alert_level': self.alert_level,
            'inference_time_ms': self.inference_time_ms,
            'is_verified': self.is_verified,
            'false_positive': self.false_positive,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_evidence:
            if self.detection_type == 'image' and self.image_url:
                data['image_url'] = self.image_url
                data['objects'] = [obj.to_dict() for obj in self.objects_detected] if self.objects_detected else []
            elif self.detection_type == 'audio' and self.audio_url:
                data['audio_url'] = self.audio_url
                data['classifications'] = [cls.to_dict() for cls in self.audio_classification_probabilities] if self.audio_classification_probabilities else []
        
        return data


class EmergencyAlert(Document):
    """
    High-priority alerts requiring immediate action.
    """
    alert_type = StringField(
        required=True,
        choices=['gunshot', 'vehicle_in_restricted_zone', 'chainsaw', 'armed_person', 'custom']
    )
    severity = StringField(
        required=True,
        choices=['critical', 'high', 'medium'],
        default='high'
    )
    
    # Source
    camera_trap = ReferenceField(CameraTrap)
    detection = ReferenceField(Detection)
    
    # Description
    description = StringField(required=True)
    location = StringField()  # e.g., "North waterhole"
    
    # Response tracking
    is_resolved = BooleanField(default=False)
    responding_ranger = ReferenceField(User)
    resolution_notes = StringField()
    
    created_at = DateTimeField(default=datetime.now)
    resolved_at = DateTimeField()
    
    meta = {
        'collection': 'emergency_alerts',
        'indexes': ['severity', 'is_resolved', 'created_at'],
        'ordering': ['-created_at']
    }
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'alert_type': self.alert_type,
            'severity': self.severity,
            'description': self.description,
            'location': self.location,
            'is_resolved': self.is_resolved,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }


class ActivityLog(Document):
    """
    Log of user activities for audit trail.
    """
    user = ReferenceField(User, required=True)
    action = StringField(required=True)  # e.g., "viewed_detection", "verified_alert"
    entity_type = StringField()  # e.g., "Detection", "Species"
    entity_id = StringField()
    details = DictField()  # Additional context
    
    created_at = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'activity_logs',
        'indexes': ['user', 'action', 'created_at'],
        'ordering': ['-created_at']
    }
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user.id),
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SystemMetrics(Document):
    """
    System performance and operational metrics.
    """
    timestamp = DateTimeField(default=datetime.now)
    
    # Camera metrics
    total_cameras = IntField()
    active_cameras = IntField()
    cameras_online = IntField()
    
    # Detection metrics
    detections_today = IntField()
    alerts_today = IntField()
    false_positive_rate = FloatField()  # Percentage
    
    # System health
    database_size_mb = FloatField()
    avg_inference_time_ms = FloatField()
    
    meta = {
        'collection': 'system_metrics',
        'indexes': ['timestamp'],
        'ordering': ['-timestamp']
    }
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'total_cameras': self.total_cameras,
            'active_cameras': self.active_cameras,
            'cameras_online': self.cameras_online,
            'detections_today': self.detections_today,
            'alerts_today': self.alerts_today,
            'false_positive_rate': self.false_positive_rate,
            'database_size_mb': self.database_size_mb,
            'avg_inference_time_ms': self.avg_inference_time_ms
        }
