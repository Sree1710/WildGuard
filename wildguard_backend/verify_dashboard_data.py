"""Verify dashboard data is populated."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from detection.models import Detection, EmergencyAlert, CameraTrap
from datetime import datetime, timedelta

print("\n" + "="*60)
print("DASHBOARD DATA VERIFICATION")
print("="*60)

today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

# Overall stats
print(f"\n[Overall Statistics]")
print(f"  Total Detections: {Detection.objects.count()}")
print(f"  Total Cameras: {CameraTrap.objects.count()}")
print(f"  Total Emergency Alerts: {EmergencyAlert.objects.count()}")

# Today's stats
print(f"\n[Today's Stats ({today.strftime('%Y-%m-%d')})]")
detections_today = Detection.objects(created_at__gte=today).count()
animals = Detection.objects(
    created_at__gte=today,
    detected_object__nin=['human', 'person', 'chainsaw', 'gunshot', 'vehicle']
).count()
humans = Detection.objects(
    created_at__gte=today,
    detected_object__in=['human', 'person']
).count()
alerts_today = Detection.objects(
    created_at__gte=today,
    alert_level__in=['high', 'critical']
).count()

print(f"  Detections Today: {detections_today}")
print(f"  Animals Detected: {animals}")
print(f"  Human Intrusions: {humans}")
print(f"  High/Critical Alerts: {alerts_today}")

# Per-day breakdown
print(f"\n[Last 7 Days Breakdown]")
days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
for i in range(6, -1, -1):
    day_start = (datetime.now() - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    count = Detection.objects(created_at__gte=day_start, created_at__lt=day_end).count()
    day_name = days[day_start.weekday()]
    marker = " <- TODAY" if i == 0 else ""
    print(f"  {day_name} ({day_start.strftime('%m/%d')}): {count} detections{marker}")

# Unresolved emergencies
unresolved = EmergencyAlert.objects(is_resolved=False).count()
print(f"\n[Unresolved Emergencies: {unresolved}]")

print("\n" + "="*60)
if detections_today > 0 and animals >= 0:
    print("SUCCESS: Dashboard should now show proper data!")
else:
    print("WARNING: Today's detections may still be low")
print("="*60)
