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
                'detection_type': det.get('detection_type', 'image'),
                'severity': det.get('alert_level', 'medium'),
                'location': camera_names.get(cam_id, 'Unknown'),
                'description': f"{det.get('detected_object', 'Unknown')} detected",
                'timestamp': det.get('created_at').strftime('%Y-%m-%d %H:%M') if det.get('created_at') else None,
                'camera_name': camera_names.get(cam_id, 'Unknown'),
                'confidence': det.get('confidence', 0),
                'image_url': det.get('image_url'),
                'audio_url': det.get('audio_url')
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
    Generate user reports with real-time analytics.
    Uses raw pymongo to avoid MongoEngine thread-local issues.
    
    Query parameters:
    - days: Number of days to report on (default: 30)
    - report_type: Type of report (detections, animals, humans, alerts, camera-status)
    """
    try:
        from pymongo import MongoClient
        from bson import ObjectId
        import certifi
        from django.conf import settings
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        days = int(request.GET.get('days', 30))
        report_type = request.GET.get('report_type', 'detections')
        
        start_date = datetime.now() - timedelta(days=days)
        end_date = datetime.now()
        
        # Base query
        base_query = {'created_at': {'$gte': start_date}}
        
        # List of human-related detection objects to exclude from wildlife reports
        human_objects = ['Human', 'human', 'Poacher', 'poacher', 'Vehicle', 'vehicle', 
                        'Person', 'person', 'Intruder', 'intruder', 'Human Activity',
                        'Human activity', 'human activity']
        
        # Apply report type filters
        if report_type == 'animals':
            base_query['detection_type'] = 'image'
            # Exclude all human-related detections
            base_query['detected_object'] = {'$nin': human_objects}
        elif report_type == 'humans':
            base_query['detected_object'] = {'$in': human_objects}
        elif report_type == 'alerts':
            base_query['alert_level'] = {'$in': ['high', 'critical']}
        
        # Get detection counts
        total_detections = db.detections.count_documents(base_query)
        
        # Count by detection type
        image_detections = db.detections.count_documents({**base_query, 'detection_type': 'image'})
        audio_detections = db.detections.count_documents({**base_query, 'detection_type': 'audio'})
        
        # Count by alert level
        critical_alerts = db.detections.count_documents({**base_query, 'alert_level': 'critical'})
        high_alerts = db.detections.count_documents({**base_query, 'alert_level': 'high'})
        medium_alerts = db.detections.count_documents({**base_query, 'alert_level': 'medium'})
        
        # Top detected objects (aggregation)
        pipeline = [
            {'$match': base_query},
            {'$group': {'_id': '$detected_object', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        top_objects = list(db.detections.aggregate(pipeline))
        
        # Daily detection counts for chart
        daily_pipeline = [
            {'$match': base_query},
            {'$group': {
                '_id': {
                    'year': {'$year': '$created_at'},
                    'month': {'$month': '$created_at'},
                    'day': {'$dayOfMonth': '$created_at'}
                },
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id': 1}}
        ]
        daily_counts = list(db.detections.aggregate(daily_pipeline))
        
        # Camera statistics
        total_cameras = db.camera_traps.count_documents({})
        active_cameras = db.camera_traps.count_documents({'is_active': True})
        
        report = {
            'period': f'Last {days} days',
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'report_type': report_type,
            'summary': {
                'total_detections': total_detections,
                'total_alerts': critical_alerts + high_alerts,
                'by_type': {
                    'image': image_detections,
                    'audio': audio_detections
                },
                'by_severity': {
                    'critical': critical_alerts,
                    'high': high_alerts,
                    'medium': medium_alerts
                }
            },
            'top_detected_objects': [
                {'object': item['_id'] or 'Unknown', 'count': item['count']} 
                for item in top_objects
            ],
            'daily_trends': [
                {
                    'date': f"{item['_id']['year']}-{item['_id']['month']:02d}-{item['_id']['day']:02d}",
                    'count': item['count']
                }
                for item in daily_counts
            ],
            'camera_status': {
                'total': total_cameras,
                'active': active_cameras,
                'inactive': total_cameras - active_cameras
            }
        }
        
        client.close()
        
        return JsonResponse({
            'success': True,
            'report': report
        }, status=200)
        
    except Exception as e:
        import traceback
        print(f"User reports error: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def generate_pdf_report(request):
    """
    Generate a professional PDF report.
    Uses reportlab for PDF generation.
    """
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        from django.http import HttpResponse
        from io import BytesIO
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.enums import TA_CENTER
        
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        days = int(request.GET.get('days', 30))
        report_type = request.GET.get('report_type', 'detections')
        
        if days == 1:
            start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime.now() - timedelta(days=days)
            
        end_date = datetime.now()
        
        base_query = {'created_at': {'$gte': start_date}}
        human_objects = ['Human', 'human', 'Poacher', 'poacher', 'Vehicle', 'vehicle', 'Person', 'person']
        
        report_title = "Detection Report"
        if report_type == 'animals':
            base_query['detection_type'] = 'image'
            base_query['detected_object'] = {'$nin': human_objects}
            report_title = "Wildlife Activity Report"
        elif report_type == 'humans':
            base_query['detected_object'] = {'$in': human_objects}
            report_title = "Human Activity Report"
        elif report_type == 'alerts':
            base_query['alert_level'] = {'$in': ['high', 'critical']}
            report_title = "Critical Alerts Report"
        
        total_detections = db.detections.count_documents(base_query)
        image_detections = db.detections.count_documents({**base_query, 'detection_type': 'image'})
        audio_detections = db.detections.count_documents({**base_query, 'detection_type': 'audio'})
        critical_alerts = db.detections.count_documents({**base_query, 'alert_level': 'critical'})
        high_alerts = db.detections.count_documents({**base_query, 'alert_level': 'high'})
        
        pipeline = [
            {'$match': base_query},
            {'$group': {'_id': '$detected_object', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        top_objects = list(db.detections.aggregate(pipeline))
        
        total_cameras = db.camera_traps.count_documents({})
        active_cameras = db.camera_traps.count_documents({'is_active': True})
        
        client.close()
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('CustomTitle', parent=styles['Title'], fontSize=22, spaceAfter=30, textColor=colors.HexColor('#1B5E20'), alignment=TA_CENTER)
        heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=14, spaceAfter=12, textColor=colors.HexColor('#2E7D32'), spaceBefore=20)
        normal_style = styles['Normal']
        
        elements = []
        
        elements.append(Paragraph(f"WildGuard {report_title}", title_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(f"<b>Period:</b> {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')} ({days} days)", normal_style))
        elements.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
        elements.append(Spacer(1, 20))
        
        elements.append(Paragraph("Summary Statistics", heading_style))
        summary_data = [
            ['Metric', 'Value'],
            ['Total Detections', str(total_detections)],
            ['Image Detections', str(image_detections)],
            ['Audio Detections', str(audio_detections)],
            ['Critical Alerts', str(critical_alerts)],
            ['High Priority Alerts', str(high_alerts)],
            ['Active Cameras', f"{active_cameras} / {total_cameras}"],
        ]
        summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E8F5E9')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#81C784')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(summary_table)
        elements.append(Spacer(1, 20))
        
        if top_objects:
            elements.append(Paragraph("Top Detected Objects", heading_style))
            top_data = [['Rank', 'Object', 'Count']]
            for i, obj in enumerate(top_objects, 1):
                top_data.append([str(i), obj['_id'] or 'Unknown', str(obj['count'])])
            top_table = Table(top_data, colWidths=[0.8*inch, 3*inch, 1.2*inch])
            top_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1565C0')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#E3F2FD')),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#90CAF9')),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(top_table)
        
        elements.append(Spacer(1, 40))
        footer_style = ParagraphStyle('Footer', parent=normal_style, fontSize=9, textColor=colors.gray, alignment=TA_CENTER)
        elements.append(Paragraph("Generated by WildGuard Anti-Poaching System", footer_style))
        
        doc.build(elements)
        
        pdf = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="WildGuard_Report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
        response.write(pdf)
        
        return response
        
    except Exception as e:
        import traceback
        print(f"PDF generation error: {traceback.format_exc()}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


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
