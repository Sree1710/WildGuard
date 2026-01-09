"""
Accounts Views - Authentication
================================
Login, signup, and JWT token management.
"""

import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from detection.models import User
from accounts.auth import JWTHandler, require_auth
import hashlib
import os

@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """
    User login endpoint.
    
    Request body:
    {
        "username": "ranger1",
        "password": "secure_password"
    }
    
    Response:
    {
        "success": true,
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "user": {...}
    }
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'error': 'Username and password required'
            }, status=400)
        
        # Find user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
        
        # Verify password (in production, use proper hashing like bcrypt)
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if user.password_hash != password_hash:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
        
        if not user.is_active:
            return JsonResponse({
                'success': False,
                'error': 'Account is inactive'
            }, status=403)
        
        # Generate tokens
        access_token = JWTHandler.generate_token(str(user.id), user.role)
        refresh_token = JWTHandler.generate_refresh_token(str(user.id))
        
        # Update last login
        user.last_login = datetime.now()
        user.save()
        
        return JsonResponse({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["POST"])
def logout_view(request):
    """
    Logout endpoint.
    In JWT-based auth, logout is typically handled client-side by deleting tokens.
    """
    return JsonResponse({
        'success': True,
        'message': 'Logged out successfully'
    }, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def refresh_token_view(request):
    """
    Refresh access token using refresh token.
    
    Request body:
    {
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return JsonResponse({
                'success': False,
                'error': 'Refresh token required'
            }, status=400)
        
        success, new_token = JWTHandler.refresh_access_token(refresh_token)
        
        if not success:
            return JsonResponse({
                'success': False,
                'error': 'Invalid refresh token'
            }, status=401)
        
        return JsonResponse({
            'success': True,
            'access_token': new_token
        }, status=200)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_auth
@require_http_methods(["GET"])
def user_profile_view(request):
    """
    Get authenticated user profile.
    """
    try:
        user = User.objects.get(id=request.user_id)
        return JsonResponse({
            'success': True,
            'user': user.to_dict(include_sensitive=True)
        }, status=200)
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'User not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
