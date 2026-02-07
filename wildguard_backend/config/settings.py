"""
Django Settings Configuration
=============================
MongoDB and REST framework configuration for WildGuard backend.
"""

import os
from pathlib import Path
from datetime import timedelta

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')

# Security
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'wildguard-insecure-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Installed apps
INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'corsheaders',
    'detection.apps.DetectionConfig',  # Use AppConfig for auto-detection generator
    'admin_module',
    'user_module',
    'accounts'
]

# URL Configuration
ROOT_URLCONF = 'config.urls'

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# MongoDB Configuration - MUST be set via environment variable
# NEVER hardcode credentials here!
MONGO_HOST = os.environ.get('MONGODB_HOST')
MONGO_DB = os.environ.get('MONGODB_DB', 'Wildguard')

if not MONGO_HOST:
    raise ValueError(
        "MONGODB_HOST environment variable is required. "
        "Set it in .env file or export it before running the server."
    )

# MongoDB Connection
import mongoengine as me  # type: ignore
from pymongo import MongoClient
import certifi

# Use certifi for SSL certificates with Atlas
me.disconnect_all()  # Clear any existing connections
me.connect(
    db=MONGO_DB,
    host=MONGO_HOST,
    alias='default',
    tlsCAFile=certifi.where()
)

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'wildguard-jwt-secret')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRY_HOURS = 24

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'wildguard.log'),
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
        },
        'wildguard': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        },
    },
}

# Create logs directory
os.makedirs(os.path.join(BASE_DIR, 'logs'), exist_ok=True)
os.makedirs(MEDIA_ROOT, exist_ok=True)

# Auto Detection Generator Configuration
# Set to False to disable automatic detection generation
AUTO_GENERATE_DETECTIONS = os.environ.get('AUTO_GENERATE_DETECTIONS', 'True') == 'True'
