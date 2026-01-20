"""
Detection Module Views
======================
Core detection API endpoints.
"""

import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from detection.models import Detection, User, ActivityLog
from accounts.auth import require_auth, require_role


@require_auth
@require_http_methods(["GET"])
def list_detections(request):
    """
    List detections with filtering and pagination.
    
    Query parameters:
    - object_type: Filter by detected object
    - alert_level: Filter by alert level
    - verified: Filter by verification status (true/false)
    - limit: Number of results (default: 20)
    - offset: Pagination offset (default: 0)
    """
    try:
        # Filters
        object_type = request.GET.get('object_type')
        alert_level = request.GET.get('alert_level')
        verified_filter = request.GET.get('verified')
        
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
        
        # Build query
        query = Detection.objects.all().order_by('-created_at')
        
        if object_type:
            query = query.filter(detected_object__icontains=object_type)
        
        if alert_level:
            query = query.filter(alert_level=alert_level)
        
        if verified_filter:
            query = query.filter(is_verified=verified_filter.lower() == 'true')
        
        # Pagination
        total = query.count()
        detections = query[offset:offset + limit]
        
        data = [det.to_dict() for det in detections]
        
        return JsonResponse({
            'success': True,
            'total': total,
            'count': len(data),
            'limit': limit,
            'offset': offset,
            'data': data
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def detection_detail(request, detection_id):
    """
    Get detailed information about a specific detection.
    """
    try:
        detection = Detection.objects.get(id=detection_id)
        
        # Log access
        current_user = User.objects.get(id=request.user_id)
        ActivityLog(
            user=current_user,
            action='viewed_detection',
            entity_type='Detection',
            entity_id=str(detection.id)
        ).save()
        
        return JsonResponse({
            'success': True,
            'detection': detection.to_dict(include_evidence=True)
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


@csrf_exempt
@require_auth
@require_role('admin')
@require_http_methods(["POST"])
def verify_detection(request, detection_id):
    """
    Verify a detection as true positive or false positive.
    
    Request body:
    {
        "verified": true,
        "false_positive": false,
        "notes": "Confirmed elephant sighting"
    }
    """
    try:
        detection = Detection.objects.get(id=detection_id)
        current_user = User.objects.get(id=request.user_id)
        data = json.loads(request.body)
        
        detection.is_verified = data.get('verified', False)
        detection.false_positive = data.get('false_positive', False)
        detection.notes = data.get('notes', '')
        detection.verified_by = current_user
        
        detection.save()
        
        # Log activity
        ActivityLog(
            user=current_user,
            action='verified_detection',
            entity_type='Detection',
            entity_id=str(detection.id),
            details={
                'verified': detection.is_verified,
                'false_positive': detection.false_positive
            }
        ).save()
        
        return JsonResponse({
            'success': True,
            'detection': detection.to_dict()
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
