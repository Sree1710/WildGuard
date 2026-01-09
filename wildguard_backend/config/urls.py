"""
URL Configuration
=================
Main URL router for WildGuard API.
"""

from django.urls import path, include
from rest_framework import routers
from detection import views as detection_views
from admin_module import views as admin_views
from user_module import views as user_views
from accounts import views as account_views

# Include all app URLs
urlpatterns = [
    # Authentication
    path('api/auth/login/', account_views.login_view, name='login'),
    path('api/auth/logout/', account_views.logout_view, name='logout'),
    path('api/auth/refresh/', account_views.refresh_token_view, name='refresh'),
    path('api/auth/profile/', account_views.user_profile_view, name='profile'),
    
    # Detection APIs
    path('api/detections/', detection_views.list_detections, name='list_detections'),
    path('api/detections/<str:detection_id>/', detection_views.detection_detail, name='detection_detail'),
    path('api/detections/<str:detection_id>/verify/', detection_views.verify_detection, name='verify_detection'),
    
    # Admin APIs
    path('api/admin/dashboard/', admin_views.dashboard_view, name='admin_dashboard'),
    path('api/admin/species/', admin_views.species_list, name='species_list'),
    path('api/admin/species/create/', admin_views.create_species, name='create_species'),
    path('api/admin/species/<str:species_id>/', admin_views.update_species, name='update_species'),
    path('api/admin/cameras/', admin_views.camera_list, name='camera_list'),
    path('api/admin/cameras/create/', admin_views.create_camera, name='create_camera'),
    path('api/admin/cameras/<str:camera_id>/', admin_views.update_camera, name='update_camera'),
    path('api/admin/emergency/', admin_views.emergency_list, name='emergency_list'),
    path('api/admin/emergency/<str:alert_id>/resolve/', admin_views.resolve_emergency, name='resolve_emergency'),
    path('api/admin/system-monitoring/', admin_views.system_monitoring, name='system_monitoring'),
    
    # User APIs
    path('api/user/alerts/', user_views.user_alerts, name='user_alerts'),
    path('api/user/activity-timeline/', user_views.activity_timeline, name='activity_timeline'),
    path('api/user/evidence/<str:detection_id>/', user_views.evidence_viewer, name='evidence_viewer'),
    path('api/user/reports/', user_views.user_reports, name='user_reports'),
    path('api/user/emergency-info/', user_views.emergency_info, name='emergency_info'),
    path('api/user/dashboard/', user_views.user_dashboard, name='user_dashboard'),
]
