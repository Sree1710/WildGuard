"""
Accounts Views - Authentication
================================
Login, signup, JWT token management, and password reset.
"""

import json
import secrets
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from accounts.auth import JWTHandler, require_auth
import hashlib
from pymongo import MongoClient
from django.conf import settings
import certifi
from detection.models import User

# Direct MongoDB connection for auth (avoids mongoengine threading issues)
def get_db():
    client = MongoClient(settings.MONGO_HOST, tlsCAFile=certifi.where())
    return client[settings.MONGO_DB]

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
        
        # Find user using pymongo directly (avoids mongoengine threading issues)
        db = get_db()
        user = db.users.find_one({'username': username})
        
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
        
        # Verify password (in production, use proper hashing like bcrypt)
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        if user.get('password_hash') != password_hash:
            return JsonResponse({
                'success': False,
                'error': 'Invalid credentials'
            }, status=401)
        
        if not user.get('is_active', True):
            return JsonResponse({
                'success': False,
                'error': 'Account is inactive'
            }, status=403)
        
        # Generate tokens
        user_id = str(user['_id'])
        user_role = user.get('role', 'user')
        access_token = JWTHandler.generate_token(user_id, user_role)
        refresh_token = JWTHandler.generate_refresh_token(user_id)
        
        # Update last login
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.now()}}
        )
        
        return JsonResponse({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id,
                'username': user.get('username'),
                'email': user.get('email'),
                'name': user.get('full_name'),
                'role': user_role
            }
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



@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    """
    User registration endpoint.
    """
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        full_name = data.get('fullName')
        
        if not all([username, password, email, full_name]):
            return JsonResponse({
                'success': False,
                'error': 'All fields are required'
            }, status=400)
            
        db = get_db()
        
        # Check if user exists
        if db.users.find_one({'username': username}):
            return JsonResponse({'success': False, 'error': 'Username already exists'}, status=400)
            
        if db.users.find_one({'email': email}):
            return JsonResponse({'success': False, 'error': 'Email already exists'}, status=400)
            
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Create user
        new_user = {
            'username': username,
            'email': email,
            'full_name': full_name,
            'password_hash': password_hash,
            'role': 'user',  # Default role
            'is_active': True,
            'created_at': datetime.now(),
            'last_login': None
        }
        
        result = db.users.insert_one(new_user)
        
        # Auto-login
        user_id = str(result.inserted_id)
        access_token = JWTHandler.generate_token(user_id, 'user')
        refresh_token = JWTHandler.generate_refresh_token(user_id)
        
        return JsonResponse({
            'success': True,
            'message': 'Account created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'name': full_name,
                'role': 'user'
            }
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


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


@csrf_exempt
@require_http_methods(["POST"])
def forgot_password_view(request):
    """
    Request password reset - generates a reset token.
    
    Request body:
    {
        "email": "user@example.com"
    }
    
    Response:
    {
        "success": true,
        "message": "If an account exists with this email, a reset link has been generated.",
        "reset_token": "..." // In production, this would be sent via email
    }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email is required'
            }, status=400)
        
        db = get_db()
        user = db.users.find_one({'email': email})
        
        # Generate reset token regardless of whether user exists (security best practice)
        reset_token = secrets.token_urlsafe(32)
        token_expiry = datetime.now() + timedelta(hours=1)  # Token valid for 1 hour
        
        response_data = {
            'success': True,
            'message': 'If an account exists with this email, a reset link has been generated.'
        }
        
        if user:
            # Store reset token in database
            db.users.update_one(
                {'_id': user['_id']},
                {
                    '$set': {
                        'reset_token': reset_token,
                        'reset_token_expiry': token_expiry
                    }
                }
            )
            
            # In development, return the token directly
            # In production, this would be sent via email
            if settings.DEBUG:
                response_data['reset_token'] = reset_token
                response_data['debug_info'] = {
                    'note': 'In production, this token would be sent via email',
                    'reset_url': f'http://localhost:3000/reset-password?token={reset_token}'
                }
        
        return JsonResponse(response_data, status=200)
        
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


@csrf_exempt
@require_http_methods(["POST"])
def reset_password_view(request):
    """
    Reset password using the reset token.
    
    Request body:
    {
        "token": "reset_token_here",
        "new_password": "new_secure_password"
    }
    
    Response:
    {
        "success": true,
        "message": "Password has been reset successfully"
    }
    """
    try:
        data = json.loads(request.body)
        token = data.get('token', '').strip()
        new_password = data.get('new_password', '')
        
        if not token:
            return JsonResponse({
                'success': False,
                'error': 'Reset token is required'
            }, status=400)
        
        if not new_password:
            return JsonResponse({
                'success': False,
                'error': 'New password is required'
            }, status=400)
        
        if len(new_password) < 6:
            return JsonResponse({
                'success': False,
                'error': 'Password must be at least 6 characters long'
            }, status=400)
        
        db = get_db()
        user = db.users.find_one({
            'reset_token': token,
            'reset_token_expiry': {'$gt': datetime.now()}
        })
        
        if not user:
            return JsonResponse({
                'success': False,
                'error': 'Invalid or expired reset token'
            }, status=400)
        
        # Hash new password and update user
        new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        db.users.update_one(
            {'_id': user['_id']},
            {
                '$set': {
                    'password_hash': new_password_hash,
                    'updated_at': datetime.now()
                },
                '$unset': {
                    'reset_token': '',
                    'reset_token_expiry': ''
                }
            }
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Password has been reset successfully. You can now login with your new password.'
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


@csrf_exempt
@require_http_methods(["GET"])
def verify_reset_token_view(request):
    """
    Verify if a reset token is valid.
    
    Query params:
    ?token=reset_token_here
    
    Response:
    {
        "success": true,
        "valid": true
    }
    """
    try:
        token = request.GET.get('token', '').strip()
        
        if not token:
            return JsonResponse({
                'success': False,
                'error': 'Token is required'
            }, status=400)
        
        db = get_db()
        user = db.users.find_one({
            'reset_token': token,
            'reset_token_expiry': {'$gt': datetime.now()}
        })
        
        return JsonResponse({
            'success': True,
            'valid': user is not None
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
