# Detection models package
from .models import (
    User, Species, CameraTrap, Detection,
    EmergencyAlert, ActivityLog, SystemMetrics,
    ObjectDetection, AudioProbability, BoundingBox
)

__all__ = [
    'User', 'Species', 'CameraTrap', 'Detection',
    'EmergencyAlert', 'ActivityLog', 'SystemMetrics',
    'ObjectDetection', 'AudioProbability', 'BoundingBox'
]
