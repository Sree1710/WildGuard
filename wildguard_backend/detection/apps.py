"""
Detection App Configuration
============================
Configures the detection Django app and starts the background detection generator.
"""

from django.apps import AppConfig
import os


class DetectionConfig(AppConfig):
    """Django app configuration for detection module."""
    
    name = 'detection'
    verbose_name = 'Wildlife Detection System'
    
    def ready(self):
        """Called when Django app is ready. Starts background detection generator."""
        # Only run in the main process (not in reloader)
        # Check for RUN_MAIN env var which is set by Django's reloader
        if os.environ.get('RUN_MAIN') == 'true':
            from detection.detection_generator import start_generator
            
            # Check if auto-generation is enabled (default: True)
            from django.conf import settings
            auto_generate = getattr(settings, 'AUTO_GENERATE_DETECTIONS', True)
            
            if auto_generate:
                print("\n[WildGuard] Starting automatic detection generator...")
                start_generator()
                print("[WildGuard] Detection generator is now running in background")
                print("[WildGuard] New detections will appear every 2-5 minutes\n")
