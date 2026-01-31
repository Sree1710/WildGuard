"""
JWT AUTHENTICATION
===================
Simple JWT authentication for WildGuard API.

Uses JSON Web Tokens for stateless authentication.
"""

import jwt  # type: ignore
import os
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Tuple, Optional
from django.http import JsonResponse

class JWTHandler:
    """Handle JWT token generation and validation."""
    
    SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'wildguard-secret-key-change-in-production')
    ALGORITHM = 'HS256'
    TOKEN_EXPIRY_HOURS = 24
    REFRESH_TOKEN_EXPIRY_DAYS = 7
    
    @classmethod
    def generate_token(cls, user_id: str, role: str) -> str:
        """
        Generate JWT access token.
        
        Parameters:
        -----------
        user_id : str
            User MongoDB ObjectId
        role : str
            User role (admin or user)
            
        Returns:
        --------
        token : str
            Encoded JWT token
        """
        payload = {
            'user_id': user_id,
            'role': role,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=cls.TOKEN_EXPIRY_HOURS)
        }
        
        token = jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return token
    
    @classmethod
    def generate_refresh_token(cls, user_id: str) -> str:
        """Generate refresh token with longer expiry."""
        payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(days=cls.REFRESH_TOKEN_EXPIRY_DAYS)
        }
        
        token = jwt.encode(payload, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return token
    
    @classmethod
    def verify_token(cls, token: str) -> Tuple[bool, Optional[Dict]]:
        """
        Verify JWT token and extract payload.
        
        Parameters:
        -----------
        token : str
            JWT token string
            
        Returns:
        --------
        is_valid : bool
            Whether token is valid
        payload : dict
            Decoded payload if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return True, payload
        except jwt.ExpiredSignatureError:
            return False, {'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return False, {'error': 'Invalid token'}
    
    @classmethod
    def refresh_access_token(cls, refresh_token: str) -> Tuple[bool, Optional[str]]:
        """
        Generate new access token using refresh token.
        
        Parameters:
        -----------
        refresh_token : str
            Valid refresh token
            
        Returns:
        --------
        success : bool
            Whether refresh was successful
        new_token : str
            New access token if successful
        """
        is_valid, payload = cls.verify_token(refresh_token)
        
        if not is_valid or payload.get('type') != 'refresh':
            return False, None
        
        user_id = payload.get('user_id')
        # In production, would fetch user to get current role
        new_token = cls.generate_token(user_id, role='user')
        
        return True, new_token


def require_auth(func):
    """
    Decorator to require JWT authentication.
    Validates token from Authorization header.
    """
    @wraps(func)
    def wrapper(request, *args, **kwargs):
        # Extract token from Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'success': False,
                'error': 'Missing or invalid Authorization header'
            }, status=401)
        
        token = auth_header.split(' ')[1]
        
        is_valid, payload = JWTHandler.verify_token(token)
        
        if not is_valid:
            return JsonResponse({
                'success': False,
                'error': payload.get('error', 'Invalid token')
            }, status=401)
        
        # Attach user info to request
        request.user_id = payload.get('user_id')
        request.user_role = payload.get('role')
        
        return func(request, *args, **kwargs)
    
    return wrapper


def require_role(required_role):
    """
    Decorator to require specific role.
    Must be used after @require_auth.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not hasattr(request, 'user_role'):
                return JsonResponse({
                    'success': False,
                    'error': 'Authentication required'
                }, status=401)
            
            if request.user_role != required_role and required_role != 'any':
                return JsonResponse({
                    'success': False,
                    'error': f'Requires {required_role} role'
                }, status=403)
            
            return func(request, *args, **kwargs)
        
        return wrapper
    return decorator
