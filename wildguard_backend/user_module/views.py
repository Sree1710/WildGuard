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
    Get alerts for the user's assigned cameras.
    
    Query parameters:
    - level: Filter by alert level (high, medium, critical)
    - resolved: Filter by resolution status (true/false)
    - days: Number of days to look back (default: 7)
    """
    try:
        current_user = User.objects.get(id=request.user_id)
        
        # Get user's assigned cameras (if user role)
        if current_user.role == 'user':
            camera_ids = [str(cam.id) for cam in current_user.assigned_cameras]
            if not camera_ids:
                return JsonResponse({
                    'success': True,
                    'alerts': [],
                    'message': 'No cameras assigned'
                }, status=200)
        else:
            # Admin sees all
            camera_ids = [str(cam.id) for cam in CameraTrap.objects.all()]
        
        # Filter alerts
        days = int(request.GET.get('days', 7))
        start_date = datetime.now() - timedelta(days=days)
        
        query = Detection.objects(
            created_at__gte=start_date,
            camera_trap__id__in=camera_ids,
            alert_level__in=['medium', 'high', 'critical']
        ).order_by('-created_at')
        
        alert_level_filter = request.GET.get('level')
        if alert_level_filter:
            query = query.filter(alert_level=alert_level_filter)
        
        alerts = [det.to_dict() for det in query]
        
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
    User dashboard showing assigned cameras and recent activity.
    """
    try:
        current_user = User.objects.get(id=request.user_id)
        
        # Get assigned cameras
        assigned_cameras = current_user.assigned_cameras if current_user.assigned_cameras else []
        
        # Recent detections on assigned cameras
        camera_ids = [cam.id for cam in assigned_cameras]
        recent_detections = Detection.objects(
            camera_trap__id__in=camera_ids
        ).order_by('-created_at')[:10]
        
        # Statistics
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        detections_today = Detection.objects(
            camera_trap__id__in=camera_ids,
            created_at__gte=today
        ).count()
        
        alerts_today = Detection.objects(
            camera_trap__id__in=camera_ids,
            created_at__gte=today,
            alert_level__in=['high', 'critical']
        ).count()
        
        dashboard = {
            'user': current_user.to_dict(),
            'assigned_cameras': len(assigned_cameras),
            'stats_today': {
                'detections': detections_today,
                'alerts': alerts_today
            },
            'recent_detections': [
                {
                    'id': str(det.id),
                    'object': det.detected_object,
                    'confidence': det.confidence,
                    'alert_level': det.alert_level,
                    'timestamp': det.created_at.isoformat() if det.created_at else None,
                    'camera_name': det.camera_trap.name
                }
                for det in recent_detections
            ]
        }
        
        return JsonResponse({
            'success': True,
            'dashboard': dashboard
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
