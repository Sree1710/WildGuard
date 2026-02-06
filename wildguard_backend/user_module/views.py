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
    
    Visibility Rules (Alert-Level Based):
    - Critical/High alerts: Show immediately (with 'unverified' badge if not verified)
    - Medium/Low alerts: Show only after admin verification
    
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
        
        # Build query with alert-level based visibility
        # Rule: Show if (verified=True) OR (alert_level in [critical, high])
        query = {
            'created_at': {'$gte': start_date},
            'camera_trap': {'$in': camera_ids},
            'alert_level': {'$in': ['medium', 'high', 'critical']},
            '$or': [
                {'is_verified': True},  # All verified detections
                {'alert_level': {'$in': ['critical', 'high']}}  # Unverified but critical/high
            ]
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
            is_verified = det.get('is_verified', False)
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
                'audio_url': det.get('audio_url'),
                'is_verified': is_verified  # Include for frontend badge
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
    Generate a professional PDF report with Google-quality design.
    Uses reportlab for PDF generation with enhanced styling.
    """
    try:
        from pymongo import MongoClient
        import certifi
        from django.conf import settings
        from django.http import HttpResponse
        from io import BytesIO
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4, letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch, cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        from reportlab.graphics.shapes import Drawing, Rect, String
        from reportlab.graphics.charts.barcharts import VerticalBarChart
        from reportlab.graphics.charts.piecharts import Pie
        
        # Connect to MongoDB
        client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
        db = client[settings.MONGO_DB]
        
        days = int(request.GET.get('days', 30))
        report_type = request.GET.get('report_type', 'detections')
        
        if days == 1:
            start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = datetime.now() - timedelta(days=days)
            
        end_date = datetime.now()
        
        # Build query based on report type
        base_query = {'created_at': {'$gte': start_date}}
        human_objects = ['Human', 'human', 'Poacher', 'poacher', 'Vehicle', 'vehicle', 'Person', 'person']
        
        report_title = "Detection Report"
        report_subtitle = "Comprehensive Wildlife Monitoring Analysis"
        if report_type == 'animals':
            base_query['detection_type'] = 'image'
            base_query['detected_object'] = {'$nin': human_objects}
            report_title = "Wildlife Activity Report"
            report_subtitle = "Fauna Detection & Movement Patterns"
        elif report_type == 'humans':
            base_query['detected_object'] = {'$in': human_objects}
            report_title = "Human Activity Report"
            report_subtitle = "Threat Detection & Security Analysis"
        elif report_type == 'alerts':
            base_query['alert_level'] = {'$in': ['high', 'critical']}
            report_title = "Critical Alerts Report"
            report_subtitle = "High Priority Incident Summary"
        
        # Gather statistics
        total_detections = db.detections.count_documents(base_query)
        image_detections = db.detections.count_documents({**base_query, 'detection_type': 'image'})
        audio_detections = db.detections.count_documents({**base_query, 'detection_type': 'audio'})
        critical_alerts = db.detections.count_documents({**base_query, 'alert_level': 'critical'})
        high_alerts = db.detections.count_documents({**base_query, 'alert_level': 'high'})
        medium_alerts = db.detections.count_documents({**base_query, 'alert_level': 'medium'})
        
        # Top detected objects
        pipeline = [
            {'$match': base_query},
            {'$group': {'_id': '$detected_object', 'count': {'$sum': 1}}},
            {'$sort': {'count': -1}},
            {'$limit': 10}
        ]
        top_objects = list(db.detections.aggregate(pipeline))
        
        # Camera stats
        total_cameras = db.camera_traps.count_documents({})
        active_cameras = db.camera_traps.count_documents({'is_active': True})
        
        client.close()
        
        # Define professional color palette
        PRIMARY_GREEN = colors.HexColor('#2E7D32')
        LIGHT_GREEN = colors.HexColor('#E8F5E9')
        ACCENT_GREEN = colors.HexColor('#4CAF50')
        DARK_TEXT = colors.HexColor('#1A1A1A')
        GRAY_TEXT = colors.HexColor('#666666')
        LIGHT_GRAY = colors.HexColor('#F5F5F5')
        BORDER_GRAY = colors.HexColor('#E0E0E0')
        CRITICAL_RED = colors.HexColor('#D32F2F')
        HIGH_ORANGE = colors.HexColor('#F57C00')
        MEDIUM_YELLOW = colors.HexColor('#FFA726')
        INFO_BLUE = colors.HexColor('#1976D2')
        
        # Create PDF with professional margins
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=40, 
            leftMargin=40, 
            topMargin=40, 
            bottomMargin=60
        )
        
        # Custom styles
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=28,
            spaceAfter=5,
            textColor=PRIMARY_GREEN,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            leading=34
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            textColor=GRAY_TEXT,
            alignment=TA_CENTER,
            fontName='Helvetica'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            spaceBefore=25,
            textColor=PRIMARY_GREEN,
            fontName='Helvetica-Bold',
            borderPadding=(0, 0, 5, 0)
        )
        
        subheading_style = ParagraphStyle(
            'SubHeading',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=10,
            textColor=GRAY_TEXT,
            fontName='Helvetica-Oblique'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            textColor=DARK_TEXT,
            fontName='Helvetica',
            leading=14
        )
        
        elements = []
        
        # ===== HEADER SECTION =====
        # Brand header with decorative line
        header_data = [[
            Paragraph("🦁 WILDGUARD", ParagraphStyle('Brand', fontSize=14, textColor=PRIMARY_GREEN, fontName='Helvetica-Bold')),
            Paragraph("Anti-Poaching Intelligence System", ParagraphStyle('Tagline', fontSize=9, textColor=GRAY_TEXT, alignment=TA_RIGHT))
        ]]
        header_table = Table(header_data, colWidths=[3*inch, 4*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, 0), 'LEFT'),
            ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ]))
        elements.append(header_table)
        
        # Decorative line
        elements.append(HRFlowable(width="100%", thickness=2, color=ACCENT_GREEN, spaceAfter=20))
        
        # ===== TITLE SECTION =====
        elements.append(Paragraph(report_title, title_style))
        elements.append(Paragraph(report_subtitle, subtitle_style))
        
        # Report metadata box
        period_text = f"<b>Report Period:</b> {start_date.strftime('%B %d, %Y')} — {end_date.strftime('%B %d, %Y')}"
        generated_text = f"<b>Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        
        meta_data = [[
            Paragraph(period_text, ParagraphStyle('Meta', fontSize=10, textColor=DARK_TEXT)),
            Paragraph(generated_text, ParagraphStyle('Meta', fontSize=10, textColor=DARK_TEXT, alignment=TA_RIGHT))
        ]]
        meta_table = Table(meta_data, colWidths=[3.5*inch, 3.5*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GREEN),
            ('BOX', (0, 0), (-1, -1), 1, ACCENT_GREEN),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 25))
        
        # ===== EXECUTIVE SUMMARY =====
        elements.append(Paragraph("📊 Executive Summary", heading_style))
        elements.append(Paragraph("Key performance indicators for the reporting period", subheading_style))
        
        # Metric cards in a grid (2x3)
        def create_metric_cell(value, label, color):
            return [
                Paragraph(f"<font size='24' color='{color}'><b>{value}</b></font>", 
                         ParagraphStyle('MetricValue', alignment=TA_CENTER, leading=30)),
                Paragraph(f"<font size='9' color='#666666'>{label}</font>", 
                         ParagraphStyle('MetricLabel', alignment=TA_CENTER))
            ]
        
        metrics_row1 = [
            create_metric_cell(str(total_detections), "Total Detections", "#1976D2"),
            create_metric_cell(str(image_detections), "Image Detections", "#4CAF50"),
            create_metric_cell(str(audio_detections), "Audio Detections", "#9C27B0"),
        ]
        
        metrics_row2 = [
            create_metric_cell(str(critical_alerts), "Critical Alerts", "#D32F2F"),
            create_metric_cell(str(high_alerts), "High Priority", "#F57C00"),
            create_metric_cell(f"{active_cameras}/{total_cameras}", "Active Cameras", "#00BCD4"),
        ]
        
        metrics_data = [
            [metrics_row1[0], metrics_row1[1], metrics_row1[2]],
            [metrics_row2[0], metrics_row2[1], metrics_row2[2]],
        ]
        
        # Flatten the nested structure for table
        flat_metrics = []
        for row in [metrics_row1, metrics_row2]:
            flat_row = []
            for cell in row:
                # Create a mini table for each cell
                cell_table = Table([[cell[0]], [cell[1]]], colWidths=[2.2*inch])
                cell_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ]))
                flat_row.append(cell_table)
            flat_metrics.append(flat_row)
        
        metrics_table = Table(flat_metrics, colWidths=[2.4*inch, 2.4*inch, 2.4*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('BOX', (0, 0), (0, 0), 1, BORDER_GRAY),
            ('BOX', (1, 0), (1, 0), 1, BORDER_GRAY),
            ('BOX', (2, 0), (2, 0), 1, BORDER_GRAY),
            ('BOX', (0, 1), (0, 1), 1, BORDER_GRAY),
            ('BOX', (1, 1), (1, 1), 1, BORDER_GRAY),
            ('BOX', (2, 1), (2, 1), 1, BORDER_GRAY),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 20))
        
        # ===== ALERT SEVERITY BREAKDOWN =====
        if critical_alerts > 0 or high_alerts > 0 or medium_alerts > 0:
            elements.append(Paragraph("🚨 Alert Severity Analysis", heading_style))
            elements.append(Paragraph("Distribution of alerts by priority level", subheading_style))
            
            severity_data = [
                ['Severity Level', 'Count', 'Status'],
                ['🔴 Critical', str(critical_alerts), 'Immediate Action Required'],
                ['🟠 High', str(high_alerts), 'Priority Response Needed'],
                ['🟡 Medium', str(medium_alerts), 'Monitor & Review'],
            ]
            
            severity_table = Table(severity_data, colWidths=[2*inch, 1.5*inch, 3*inch])
            severity_table.setStyle(TableStyle([
                # Header
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_GREEN),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                # Body
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (0, 1), (0, -1), 'LEFT'),
                ('ALIGN', (1, 1), (1, -1), 'CENTER'),
                ('ALIGN', (2, 1), (2, -1), 'LEFT'),
                # Row colors - alternating
                ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#FFEBEE')),
                ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFF3E0')),
                ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FFFDE7')),
                # Grid
                ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ]))
            elements.append(severity_table)
            elements.append(Spacer(1, 20))
        
        # ===== TOP DETECTED OBJECTS =====
        if top_objects:
            elements.append(Paragraph("🐾 Top Detected Objects", heading_style))
            elements.append(Paragraph("Most frequently detected species and objects", subheading_style))
            
            top_data = [['Rank', 'Object/Species', 'Detection Count', 'Percentage']]
            total_for_percent = sum(obj['count'] for obj in top_objects) if top_objects else 1
            
            for i, obj in enumerate(top_objects, 1):
                percentage = f"{(obj['count'] / total_for_percent * 100):.1f}%"
                rank_emoji = "🥇" if i == 1 else ("🥈" if i == 2 else ("🥉" if i == 3 else f"#{i}"))
                top_data.append([
                    rank_emoji,
                    obj['_id'] or 'Unknown',
                    str(obj['count']),
                    percentage
                ])
            
            top_table = Table(top_data, colWidths=[0.8*inch, 3*inch, 1.5*inch, 1.2*inch])
            top_table.setStyle(TableStyle([
                # Header
                ('BACKGROUND', (0, 0), (-1, 0), INFO_BLUE),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                # Body
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ALIGN', (0, 1), (0, -1), 'CENTER'),
                ('ALIGN', (1, 1), (1, -1), 'LEFT'),
                ('ALIGN', (2, 1), (-1, -1), 'CENTER'),
                # Alternating rows
                ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E3F2FD')),
                ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#E3F2FD')),
                ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#E3F2FD')),
                ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#E3F2FD')),
                ('BACKGROUND', (0, 9), (-1, 9), colors.HexColor('#E3F2FD')),
                # Grid
                ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(top_table)
            elements.append(Spacer(1, 20))
        
        # ===== CAMERA STATUS =====
        elements.append(Paragraph("📷 Camera System Status", heading_style))
        elements.append(Paragraph("Overview of camera trap network operational status", subheading_style))
        
        inactive_cameras = total_cameras - active_cameras
        camera_data = [
            ['Status', 'Count', 'Percentage'],
            ['🟢 Active', str(active_cameras), f"{(active_cameras/max(total_cameras,1)*100):.1f}%"],
            ['🔴 Inactive', str(inactive_cameras), f"{(inactive_cameras/max(total_cameras,1)*100):.1f}%"],
            ['📊 Total', str(total_cameras), "100%"],
        ]
        
        camera_table = Table(camera_data, colWidths=[2.5*inch, 2*inch, 2*inch])
        camera_table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#00838F')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            # Body
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
            # Row colors
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E0F7FA')),
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFEBEE')),
            ('BACKGROUND', (0, 3), (-1, 3), LIGHT_GRAY),
            ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GRAY),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(camera_table)
        
        # ===== FOOTER =====
        elements.append(Spacer(1, 40))
        elements.append(HRFlowable(width="100%", thickness=1, color=BORDER_GRAY, spaceAfter=15))
        
        footer_style = ParagraphStyle(
            'Footer',
            parent=normal_style,
            fontSize=9,
            textColor=GRAY_TEXT,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("This report was automatically generated by WildGuard Anti-Poaching System", footer_style))
        elements.append(Paragraph("© 2025 WildGuard | Protecting Wildlife Through Intelligent Monitoring", footer_style))
        
        # Build PDF
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
        
        # Recent detections with alert-level based visibility
        # Rule: Show if (verified=True) OR (alert_level in [critical, high])
        recent_detections_raw = list(db.detections.find({
            'camera_trap': {'$in': camera_ids},
            '$or': [
                {'is_verified': True},  # All verified detections
                {'alert_level': {'$in': ['critical', 'high']}}  # Unverified but critical/high
            ]
        }).sort('created_at', -1).limit(10))
        
        recent_detections = []
        for det in recent_detections_raw:
            cam_id = str(det.get('camera_trap', ''))
            recent_detections.append({
                'id': str(det.get('_id', '')),
                'object': det.get('detected_object', 'unknown'),
                'confidence': det.get('confidence', 0),
                'alert_level': det.get('alert_level', 'low'),
                'timestamp': det.get('created_at').isoformat() if det.get('created_at') else None,
                'camera_name': camera_names.get(cam_id, 'Unknown'),
                'is_verified': det.get('is_verified', False)  # Include for frontend badge
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
