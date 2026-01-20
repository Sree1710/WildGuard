"""
Admin Module Views
==================
Admin dashboard and management APIs.

Endpoints:
- Dashboard statistics
- Species management (CRUD)
- Camera trap management
- Detection history
- Emergency alerts management
- System monitoring
"""

import json
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from detection.models import User, Species, CameraTrap, Detection, EmergencyAlert, SystemMetrics, ActivityLog
from accounts.auth import require_auth, require_role
from ml_services import ImageDetector, AudioDetector


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def dashboard_view(request):
    """
    Admin dashboard statistics.
    
    Returns overview of system health and detections.
    """
    try:
        # Count statistics
        total_cameras = CameraTrap.objects.count()
        active_cameras = CameraTrap.objects(is_active=True).count()
        online_cameras = CameraTrap.objects(is_online=True).count()
        
        # Detections today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        detections_today = Detection.objects(created_at__gte=today).count()
        alerts_today = Detection.objects(created_at__gte=today, alert_level__in=['high', 'critical']).count()
        
        # Unresolved emergencies
        unresolved_emergencies = EmergencyAlert.objects(is_resolved=False).count()
        
        # Recent detections
        recent_detections = Detection.objects.order_by('-created_at')[:10]
        
        dashboard_data = {
            'timestamp': datetime.now().isoformat(),
            'camera_status': {
                'total': total_cameras,
                'active': active_cameras,
                'online': online_cameras,
                'health_percentage': round((online_cameras / total_cameras * 100) if total_cameras > 0 else 0, 1)
            },
            'detection_metrics': {
                'detections_today': detections_today,
                'alerts_today': alerts_today,
                'high_priority_alerts': Detection.objects(created_at__gte=today, alert_level='critical').count()
            },
            'emergency_status': {
                'unresolved': unresolved_emergencies,
                'critical_pending': EmergencyAlert.objects(is_resolved=False, severity='critical').count()
            },
            'recent_detections': [
                {
                    'id': str(det.id),
                    'object': det.detected_object,
                    'confidence': det.confidence,
                    'alert_level': det.alert_level,
                    'timestamp': det.created_at.isoformat() if det.created_at else None,
                    'camera_id': str(det.camera_trap.id)
                }
                for det in recent_detections
            ]
        }
        
        return JsonResponse({
            'success': True,
            'data': dashboard_data
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def species_list(request):
    """
    List all species.
    Supports filtering by conservation status.
    """
    try:
        conservation_status = request.GET.get('status')
        endangered_only = request.GET.get('endangered') == 'true'
        
        query = Species.objects.all()
        
        if conservation_status:
            query = query.filter(conservation_status=conservation_status)
        if endangered_only:
            query = query.filter(is_endangered=True)
        
        species_list_data = [s.to_dict() for s in query]
        
        return JsonResponse({
            'success': True,
            'count': len(species_list_data),
            'data': species_list_data
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["POST"])
def create_species(request):
    """
    Create new species entry.
    
    Request body:
    {
        "name": "African Elephant",
        "scientific_name": "Loxodonta africana",
        "conservation_status": "Vulnerable",
        "habitat": "Savanna, forest",
        "is_endangered": true,
        "poaching_risk_level": "high"
    }
    """
    try:
        data = json.loads(request.body)
        
        species = Species(
            name=data.get('name'),
            scientific_name=data.get('scientific_name'),
            conservation_status=data.get('conservation_status', 'Least Concern'),
            habitat=data.get('habitat'),
            description=data.get('description'),
            is_endangered=data.get('is_endangered', False),
            poaching_risk_level=data.get('poaching_risk_level', 'low')
        )
        
        species.save()
        
        # Log activity
        ActivityLog(
            user=User.objects.get(id=request.user_id),
            action='created_species',
            entity_type='Species',
            entity_id=str(species.id),
            details={'name': species.name}
        ).save()
        
        return JsonResponse({
            'success': True,
            'species': species.to_dict()
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["PUT"])
def update_species(request, species_id):
    """
    Update species information.
    """
    try:
        species = Species.objects.get(id=species_id)
        data = json.loads(request.body)
        
        # Update fields
        species.name = data.get('name', species.name)
        species.scientific_name = data.get('scientific_name', species.scientific_name)
        species.conservation_status = data.get('conservation_status', species.conservation_status)
        species.habitat = data.get('habitat', species.habitat)
        species.is_endangered = data.get('is_endangered', species.is_endangered)
        species.poaching_risk_level = data.get('poaching_risk_level', species.poaching_risk_level)
        species.updated_at = datetime.now()
        
        species.save()
        
        return JsonResponse({
            'success': True,
            'species': species.to_dict()
        }, status=200)
        
    except Species.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Species not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def camera_list(request):
    """
    List all camera traps.
    Supports filtering by status and location.
    """
    try:
        status_filter = request.GET.get('status')  # active, online, offline
        location = request.GET.get('location')
        
        query = CameraTrap.objects.all()
        
        if status_filter == 'active':
            query = query.filter(is_active=True)
        elif status_filter == 'online':
            query = query.filter(is_online=True)
        elif status_filter == 'offline':
            query = query.filter(is_online=False)
        
        if location:
            query = query.filter(location__icontains=location)
        
        cameras = [c.to_dict(include_ranger=True) for c in query]
        
        return JsonResponse({
            'success': True,
            'count': len(cameras),
            'data': cameras
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["POST"])
def create_camera(request):
    """
    Register new camera trap.
    
    Request body:
    {
        "name": "CT-001",
        "location": "Waterhole North",
        "latitude": -1.2345,
        "longitude": 35.6789,
        "resolution": "1920x1080"
    }
    """
    try:
        data = json.loads(request.body)
        
        camera = CameraTrap(
            name=data.get('name'),
            location=data.get('location'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            altitude_m=data.get('altitude_m'),
            resolution=data.get('resolution', '1920x1080'),
            battery_level=data.get('battery_level', 100),
            storage_available_gb=data.get('storage_available_gb', 256)
        )
        
        camera.save()
        
        return JsonResponse({
            'success': True,
            'camera': camera.to_dict()
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["PUT"])
def update_camera(request, camera_id):
    """
    Update camera status and info.
    """
    try:
        camera = CameraTrap.objects.get(id=camera_id)
        data = json.loads(request.body)
        
        camera.is_active = data.get('is_active', camera.is_active)
        camera.is_online = data.get('is_online', camera.is_online)
        camera.battery_level = data.get('battery_level', camera.battery_level)
        camera.storage_available_gb = data.get('storage_available_gb', camera.storage_available_gb)
        camera.updated_at = datetime.now()
        
        camera.save()
        
        return JsonResponse({
            'success': True,
            'camera': camera.to_dict()
        }, status=200)
        
    except CameraTrap.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Camera not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def emergency_list(request):
    """
    List emergency alerts.
    Supports filtering by severity and resolution status.
    """
    try:
        severity = request.GET.get('severity')
        unresolved_only = request.GET.get('unresolved') == 'true'
        
        query = EmergencyAlert.objects.all().order_by('-created_at')
        
        if severity:
            query = query.filter(severity=severity)
        if unresolved_only:
            query = query.filter(is_resolved=False)
        
        alerts = [a.to_dict() for a in query]
        
        return JsonResponse({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["POST"])
def resolve_emergency(request, alert_id):
    """
    Resolve emergency alert.
    
    Request body:
    {
        "resolution_notes": "Rangers deployed, incident cleared"
    }
    """
    try:
        alert = EmergencyAlert.objects.get(id=alert_id)
        data = json.loads(request.body)
        
        alert.is_resolved = True
        alert.resolved_at = datetime.now()
        alert.resolution_notes = data.get('resolution_notes')
        alert.responding_ranger = User.objects.get(id=request.user_id)
        
        alert.save()
        
        return JsonResponse({
            'success': True,
            'alert': alert.to_dict()
        }, status=200)
        
    except EmergencyAlert.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Alert not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def system_monitoring(request):
    """
    Get system monitoring metrics.
    """
    try:
        total_cameras = CameraTrap.objects.count()
        active_cameras = CameraTrap.objects(is_active=True).count()
        online_cameras = CameraTrap.objects(is_online=True).count()
        
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        detections_today = Detection.objects(created_at__gte=today).count()
        alerts_today = Detection.objects(created_at__gte=today, alert_level__in=['high', 'critical']).count()
        
        # False positive rate
        total_verified = Detection.objects(is_verified=True).count()
        false_positives = Detection.objects(false_positive=True).count()
        false_positive_rate = (false_positives / total_verified * 100) if total_verified > 0 else 0
        
        monitoring_data = {
            'timestamp': datetime.now().isoformat(),
            'camera_metrics': {
                'total_cameras': total_cameras,
                'active_cameras': active_cameras,
                'online_cameras': online_cameras,
                'offline_cameras': total_cameras - online_cameras
            },
            'detection_metrics': {
                'detections_today': detections_today,
                'alerts_today': alerts_today,
                'total_detections': Detection.objects.count(),
                'false_positive_rate': round(false_positive_rate, 2)
            },
            'system_health': {
                'avg_inference_time_ms': 120.5,  # Mock
                'database_size_mb': 256.3,  # Mock
                'uptime_percentage': 99.8  # Mock
            }
        }
        
        return JsonResponse({
            'success': True,
            'data': monitoring_data
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
