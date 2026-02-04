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
from detection.models import User, CameraTrap, Detection, EmergencyAlert, SystemMetrics, ActivityLog
from accounts.auth import require_auth, require_role


@require_auth
@require_role('admin')
@require_http_methods(["GET"])
@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def dashboard_view(request):
    """
    Admin dashboard statistics.
    Returns overview of system health and detections.
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    """
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        # Count statistics
        total_cameras = db.camera_traps.count_documents({})
        active_cameras = db.camera_traps.count_documents({'is_active': True})
        online_cameras = db.camera_traps.count_documents({'is_online': True})
        
        # Detections today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        detections_today = db.detections.count_documents({'created_at': {'$gte': today}})
        alerts_today = db.detections.count_documents({
            'created_at': {'$gte': today}, 
            'alert_level': {'$in': ['high', 'critical']}
        })
        
        # Count by detected object type
        animals_detected = db.detections.count_documents({
            'created_at': {'$gte': today},
            'detected_object': {'$nin': ['human', 'person', 'chainsaw', 'gunshot', 'vehicle', 'Human', 'Person', 'human_activity']}
        })
        
        human_intrusions = db.detections.count_documents({
            'created_at': {'$gte': today},
            'detected_object': {'$in': ['human', 'person', 'Human', 'Person', 'human_activity']}
        })
        
        # Unresolved emergencies
        unresolved_emergencies = db.emergency_alerts.count_documents({'is_resolved': False})
        critical_pending = db.emergency_alerts.count_documents({'is_resolved': False, 'severity': 'critical'})
        
        # Recent activity (last 10 detections/alerts as activity feed)
        recent_detections = list(db.detections.find().sort('created_at', -1).limit(10))
        recent_activity = []
        
        # Get camera names for lookup
        camera_lookup = {str(c['_id']): c.get('name', 'Unknown') for c in db.camera_traps.find()}
        
        for det in recent_detections:
            try:
                alert_level = det.get('alert_level', 'none')
                activity_type = 'alert' if alert_level in ['high', 'critical'] else 'detection'
                severity = alert_level if alert_level else 'info'
                detected_obj = det.get('detected_object', 'Unknown')
                message = f"{detected_obj} detected"
                
                # Get camera name from lookup
                camera_trap_id = det.get('camera_trap')
                if camera_trap_id:
                    cam_name = camera_lookup.get(str(camera_trap_id), 'Unknown')
                    message += f" at camera {cam_name}"
                
                created_at = det.get('created_at')
                time_str = created_at.strftime('%H:%M:%S') if created_at else 'Unknown'
                
                recent_activity.append({
                    'id': str(det.get('_id', '')),
                    'type': activity_type,
                    'message': message,
                    'time': time_str,
                    'severity': severity
                })
            except Exception:
                continue
        
        # Trend data (last 7 days)
        trend_data = []
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(6, -1, -1):
            day_start = (datetime.now() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            day_base_query = {'created_at': {'$gte': day_start, '$lt': day_end}}
            
            day_animals = db.detections.count_documents({
                **day_base_query,
                'detected_object': {'$nin': ['human', 'person', 'chainsaw', 'gunshot', 'vehicle', 'Human', 'Person', 'human_activity']}
            })
            day_humans = db.detections.count_documents({
                **day_base_query,
                'detected_object': {'$in': ['human', 'person', 'Human', 'Person', 'human_activity']}
            })
            day_suspicious = db.detections.count_documents({
                **day_base_query,
                'alert_level': {'$in': ['high', 'critical']}
            })
            
            trend_data.append({
                'day': days[day_start.weekday()],
                'animals': day_animals,
                'humans': day_humans,
                'suspicious': day_suspicious
            })
            
        client.close()
        
        # Dashboard data matching frontend expectations
        dashboard_data = {
            'timestamp': datetime.now().isoformat(),
            'total_detections': detections_today,
            'animals_detected': animals_detected,
            'human_intrusions': human_intrusions,
            'alerts_today': alerts_today,
            'active_cameras': active_cameras,  # Fixed: Use active_cameras count, not online
            'trend_data': trend_data,
            'recent_activity': recent_activity,
            'camera_status': {
                'total': total_cameras,
                'active': active_cameras,
                'online': online_cameras,
                'health_percentage': round((online_cameras / total_cameras * 100) if total_cameras > 0 else 0, 1)
            },
            'emergency_status': {
                'unresolved': unresolved_emergencies,
                'critical_pending': critical_pending
            }
        }
        
        return JsonResponse({
            'success': True,
            'dashboard': dashboard_data
        }, status=200)
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Dashboard Error: {error_details}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'traceback': error_details
        }, status=500)





@require_auth
@require_role('admin')
@require_http_methods(["GET"])
def camera_list(request):
    """
    List all camera traps.
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    """
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        status_filter = request.GET.get('status')  # active, online, offline
        location = request.GET.get('location')
        
        query = {}
        
        if status_filter == 'active':
            query['is_active'] = True
        elif status_filter == 'online':
            query['is_online'] = True
        elif status_filter == 'offline':
            query['is_online'] = False
        
        if location:
            query['location'] = {'$regex': location, '$options': 'i'}
        
        cameras_raw = list(db.camera_traps.find(query))
        
        cameras = []
        for cam in cameras_raw:
            cameras.append({
                'id': str(cam.get('_id', '')),
                'name': cam.get('name', ''),
                'location': cam.get('location', ''),
                'latitude': cam.get('latitude'),
                'longitude': cam.get('longitude'),
                'is_active': cam.get('is_active', False),
                'is_online': cam.get('is_online', False),
                'last_ping': cam.get('last_ping').isoformat() if cam.get('last_ping') else None,
                'battery_level': cam.get('battery_level', 0),
                'resolution': cam.get('resolution', ''),
            })
        
        client.close()
        
        return JsonResponse({
            'success': True,
            'count': len(cameras),
            'data': cameras
        }, status=200)
        
    except Exception as e:
        import traceback
        print(f"Camera list error: {traceback.format_exc()}")
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
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    """
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        # Camera metrics
        total_cameras = db.camera_traps.count_documents({})
        active_cameras = db.camera_traps.count_documents({'is_active': True})
        inactive_cameras = total_cameras - active_cameras
        
        # Detection metrics
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        detections_today = db.detections.count_documents({'created_at': {'$gte': today}})
        alerts_today = db.detections.count_documents({
            'created_at': {'$gte': today},
            'alert_level': {'$in': ['high', 'critical']}
        })
        total_detections = db.detections.count_documents({})
        
        # False positive rate
        total_verified = db.detections.count_documents({'is_verified': True})
        false_positives = db.detections.count_documents({'false_positive': True})
        false_positive_rate = (false_positives / total_verified * 100) if total_verified > 0 else 0
        
        monitoring_data = {
            'timestamp': datetime.now().isoformat(),
            'camera_metrics': {
                'total_cameras': total_cameras,
                'active_cameras': active_cameras,
                'online_cameras': active_cameras,  # Use active as proxy for online
                'offline_cameras': inactive_cameras  # Inactive cameras count
            },
            'detection_metrics': {
                'detections_today': detections_today,
                'alerts_today': alerts_today,
                'total_detections': total_detections,
                'false_positive_rate': round(false_positive_rate, 2)
            },
            'system_health': {
                'avg_inference_time_ms': 120.5,  # Mock
                'database_size_mb': 256.3,  # Mock
                'uptime_percentage': 99.8  # Mock
            }
        }
        
        client.close()
        
        return JsonResponse({
            'success': True,
            'data': monitoring_data
        }, status=200)
        
    except Exception as e:
        import traceback
        print(f"System monitoring error: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
