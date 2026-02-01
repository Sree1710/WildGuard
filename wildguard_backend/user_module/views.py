"""
User Module Views
=================
Field staff and ranger APIs.

Endpoints:
- Live alerts
- Detection evidence viewing
- Activity timeline
- Reports
- Emergency information
- User dashboard
"""

import json
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from detection.models import Detection, EmergencyAlert, ActivityLog, User, CameraTrap
from accounts.auth import require_auth, require_role


@require_auth
@require_http_methods(["GET"])
def user_alerts(request):
    """
    Get alerts for cameras.
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    
    Query parameters:
    - level/severity: Filter by alert level (high, medium, critical)
    - days: Number of days to look back (default: 7)
    """
    try:
        from pymongo import MongoClient
        from bson import ObjectId
        import certifi
        from django.conf import settings
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        # Get all active cameras
        all_cameras = list(db.camera_traps.find({'is_active': True}))
        camera_ids = [cam['_id'] for cam in all_cameras]
        camera_names = {str(cam['_id']): cam.get('name', 'Unknown') for cam in all_cameras}
        
        # Filter by date
        days = int(request.GET.get('days', 7))
        start_date = datetime.now() - timedelta(days=days)
        
        # Build query
        query = {
            'created_at': {'$gte': start_date},
            'camera_trap': {'$in': camera_ids},
            'alert_level': {'$in': ['medium', 'high', 'critical']}
        }
        
        # Filter by severity/level if provided
        severity_filter = request.GET.get('severity') or request.GET.get('level')
        if severity_filter:
            query['alert_level'] = severity_filter
        
        # Get detections as alerts
        alerts_raw = list(db.detections.find(query).sort('created_at', -1).limit(50))
        
        alerts = []
        for det in alerts_raw:
            cam_id = str(det.get('camera_trap', ''))
            alerts.append({
                'id': str(det.get('_id', '')),
                'type': det.get('detected_object', 'unknown'),
                'severity': det.get('alert_level', 'medium'),
                'location': camera_names.get(cam_id, 'Unknown'),
                'description': f"{det.get('detected_object', 'Unknown')} detected",
                'timestamp': det.get('created_at').strftime('%Y-%m-%d %H:%M') if det.get('created_at') else None,
                'camera_name': camera_names.get(cam_id, 'Unknown'),
                'confidence': det.get('confidence', 0)
            })
        
        client.close()
        
        return JsonResponse({
            'success': True,
            'count': len(alerts),
            'data': alerts
        }, status=200)
        
    except Exception as e:
        import traceback
        print(f"User alerts error: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def activity_timeline(request):
    """
    Get user's activity timeline.
    
    Shows actions taken by the user.
    """
    try:
        current_user = User.objects.get(id=request.user_id)
        days = int(request.GET.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        
        activities = ActivityLog.objects(
            user=current_user,
            created_at__gte=start_date
        ).order_by('-created_at')
        
        timeline = [act.to_dict() for act in activities]
        
        return JsonResponse({
            'success': True,
            'count': len(timeline),
            'data': timeline
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def evidence_viewer(request, detection_id):
    """
    Get detection evidence (image or audio).
    
    Returns detection details with evidence URLs and metadata.
    """
    try:
        detection = Detection.objects.get(id=detection_id)
        
        # Check access permission
        current_user = User.objects.get(id=request.user_id)
        if (current_user.role == 'user' and 
            detection.camera_trap not in current_user.assigned_cameras):
            return JsonResponse({
                'success': False,
                'error': 'Access denied - camera not assigned'
            }, status=403)
        
        evidence_data = {
            'detection_id': str(detection.id),
            'type': detection.detection_type,
            'object_detected': detection.detected_object,
            'confidence': detection.confidence,
            'timestamp': detection.created_at.isoformat() if detection.created_at else None,
            'camera_id': str(detection.camera_trap.id),
            'camera_name': detection.camera_trap.name,
            'alert_level': detection.alert_level
        }
        
        if detection.detection_type == 'image':
            evidence_data['image_url'] = detection.image_url
            evidence_data['objects'] = [
                obj.to_dict() for obj in detection.objects_detected
            ] if detection.objects_detected else []
        
        elif detection.detection_type == 'audio':
            evidence_data['audio_url'] = detection.audio_url
            evidence_data['classifications'] = [
                cls.to_dict() for cls in detection.audio_classification_probabilities
            ] if detection.audio_classification_probabilities else []
        
        # Log activity
        ActivityLog(
            user=current_user,
            action='viewed_evidence',
            entity_type='Detection',
            entity_id=str(detection.id)
        ).save()
        
        return JsonResponse({
            'success': True,
            'evidence': evidence_data
        }, status=200)
        
    except Detection.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Detection not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def user_reports(request):
    """
    Generate user reports.
    
    Query parameters:
    - days: Number of days to report on (default: 30)
    - camera_id: Specific camera (optional)
    """
    try:
        current_user = User.objects.get(id=request.user_id)
        days = int(request.GET.get('days', 30))
        camera_id = request.GET.get('camera_id')
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Build query
        query = Detection.objects(created_at__gte=start_date)
        
        # Filter for user's cameras
        if current_user.role == 'user':
            camera_ids = [cam.id for cam in current_user.assigned_cameras]
            query = query.filter(camera_trap__id__in=camera_ids)
        
        if camera_id:
            query = query.filter(camera_trap__id=camera_id)
        
        # Generate statistics
        total_detections = query.count()
        
        detection_by_type = {}
        for det_type in ['image', 'audio']:
            detection_by_type[det_type] = query.filter(detection_type=det_type).count()
        
        alerts_count = query.filter(alert_level__in=['high', 'critical']).count()
        
        # Top detected objects
        top_objects = {}
        for det in query:
            obj = det.detected_object
            top_objects[obj] = top_objects.get(obj, 0) + 1
        
        report = {
            'period': f'Last {days} days',
            'start_date': start_date.isoformat(),
            'end_date': datetime.now().isoformat(),
            'summary': {
                'total_detections': total_detections,
                'total_alerts': alerts_count,
                'by_type': detection_by_type
            },
            'top_detected_objects': sorted(
                [{'object': k, 'count': v} for k, v in top_objects.items()],
                key=lambda x: x['count'],
                reverse=True
            )[:10]
        }
        
        # Log activity
        ActivityLog(
            user=current_user,
            action='generated_report',
            details={'period_days': days}
        ).save()
        
        return JsonResponse({
            'success': True,
            'report': report
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def emergency_info(request):
    """
    Get emergency alert information (read-only for field staff).
    """
    try:
        # Get active/recent emergencies
        recent_emergencies = EmergencyAlert.objects(
            is_resolved=False
        ).order_by('-created_at')
        
        emergency_data = {
            'active_alerts': len(recent_emergencies),
            'emergencies': [
                {
                    'id': str(em.id),
                    'type': em.alert_type,
                    'severity': em.severity,
                    'location': em.location,
                    'description': em.description,
                    'created_at': em.created_at.isoformat() if em.created_at else None
                }
                for em in recent_emergencies[:20]
            ],
            'contact_info': {
                'emergency_hotline': '+254-XXX-XXXX',
                'ranger_coordinator': 'ranger_command@wildguard.org'
            }
        }
        
        return JsonResponse({
            'success': True,
            'data': emergency_data
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def user_dashboard(request):
    """
    User dashboard showing cameras and recent activity.
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    """
    try:
        from pymongo import MongoClient
        from bson import ObjectId
        import certifi
        from django.conf import settings
        
        # Get raw pymongo connection
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        # Get user document
        try:
            user_id = ObjectId(request.user_id)
        except:
            user_id = request.user_id
            
        user_doc = db.users.find_one({'_id': user_id})
        if not user_doc:
            client.close()
            return JsonResponse({
                'success': False,
                'error': 'User not found'
            }, status=404)
        
        # Get all active cameras
        all_cameras = list(db.camera_traps.find({'is_active': True}))
        camera_ids = [cam['_id'] for cam in all_cameras]
        cameras_count = len(all_cameras)
        
        # Camera name lookup
        camera_names = {str(cam['_id']): cam.get('name', 'Unknown') for cam in all_cameras}
        
        # Statistics for today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        detections_today = db.detections.count_documents({
            'camera_trap': {'$in': camera_ids},
            'created_at': {'$gte': today}
        })
        
        alerts_today = db.detections.count_documents({
            'camera_trap': {'$in': camera_ids},
            'created_at': {'$gte': today},
            'alert_level': {'$in': ['high', 'critical']}
        })
        
        animals_today = db.detections.count_documents({
            'camera_trap': {'$in': camera_ids},
            'created_at': {'$gte': today},
            'detected_object': {'$nin': ['human', 'person', 'chainsaw', 'gunshot', 'vehicle', 'human_activity']}
        })
        
        humans_today = db.detections.count_documents({
            'camera_trap': {'$in': camera_ids},
            'created_at': {'$gte': today},
            'detected_object': {'$in': ['human', 'person', 'human_activity']}
        })
        
        # Recent detections
        recent_detections_raw = list(db.detections.find(
            {'camera_trap': {'$in': camera_ids}}
        ).sort('created_at', -1).limit(10))
        
        recent_detections = []
        for det in recent_detections_raw:
            cam_id = str(det.get('camera_trap', ''))
            recent_detections.append({
                'id': str(det.get('_id', '')),
                'object': det.get('detected_object', 'unknown'),
                'confidence': det.get('confidence', 0),
                'alert_level': det.get('alert_level', 'low'),
                'timestamp': det.get('created_at').isoformat() if det.get('created_at') else None,
                'camera_name': camera_names.get(cam_id, 'Unknown')
            })
        
        # Build user dict
        user_info = {
            'id': str(user_doc.get('_id', '')),
            'username': user_doc.get('username', ''),
            'email': user_doc.get('email', ''),
            'full_name': user_doc.get('full_name', ''),
            'role': user_doc.get('role', 'user')
        }
        
        dashboard = {
            'user': user_info,
            'assigned_cameras': cameras_count,
            'stats_today': {
                'detections': detections_today,
                'alerts': alerts_today,
                'animals': animals_today,
                'humans': humans_today
            },
            'recent_detections': recent_detections
        }
        
        client.close()
        
        return JsonResponse({
            'success': True,
            'dashboard': dashboard
        }, status=200)
        
    except Exception as e:
        import traceback
        print(f"User dashboard error: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
