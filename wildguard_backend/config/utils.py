"""
WildGuard Backend - Utilities
=============================
Helper functions for the backend.
"""

import logging
import json
from datetime import datetime
from functools import wraps

# Configure logging
logger = logging.getLogger('wildguard')

def log_action(action_name):
    """Decorator to log API actions."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            logger.info(f"Action started: {action_name}")
            try:
                result = func(*args, **kwargs)
                logger.info(f"Action completed: {action_name}")
                return result
            except Exception as e:
                logger.error(f"Action failed: {action_name} - {str(e)}")
                raise
        return wrapper
    return decorator


def format_response(success, data=None, error=None, status_code=200):
    """
    Format API responses consistently.
    
    Parameters:
    -----------
    success : bool
        Whether operation was successful
    data : dict
        Response data payload
    error : str
        Error message if unsuccessful
    status_code : int
        HTTP status code
        
    Returns:
    --------
    response : dict
        Formatted response dictionary
    """
    response = {
        'success': success,
        'timestamp': datetime.now().isoformat()
    }
    
    if data:
        response['data'] = data
    if error:
        response['error'] = error
    
    return response, status_code


def parse_query_params(request, param_specs):
    """
    Parse and validate query parameters.
    
    Parameters:
    -----------
    request : HttpRequest
        Django request object
    param_specs : dict
        Specification for parameters
        {
            'param_name': {
                'type': int,  # int, str, bool, float
                'default': None,
                'required': False,
                'choices': []
            }
        }
        
    Returns:
    --------
    params : dict
        Parsed parameters
    errors : list
        List of validation errors
    """
    params = {}
    errors = []
    
    for param_name, spec in param_specs.items():
        value = request.GET.get(param_name)
        param_type = spec.get('type', str)
        required = spec.get('required', False)
        default = spec.get('default')
        choices = spec.get('choices', [])
        
        if value is None:
            if required and default is None:
                errors.append(f"Missing required parameter: {param_name}")
            else:
                params[param_name] = default
        else:
            try:
                # Type conversion
                if param_type == bool:
                    params[param_name] = value.lower() in ('true', '1', 'yes')
                elif param_type == int:
                    params[param_name] = int(value)
                elif param_type == float:
                    params[param_name] = float(value)
                else:
                    params[param_name] = value
                
                # Choice validation
                if choices and params[param_name] not in choices:
                    errors.append(f"Invalid choice for {param_name}: {value}")
                    
            except (ValueError, TypeError) as e:
                errors.append(f"Invalid type for {param_name}: expected {param_type.__name__}")
    
    return params, errors


def generate_cache_key(prefix, *args):
    """Generate cache key from prefix and arguments."""
    return f"{prefix}:{'_'.join(str(arg) for arg in args)}"


def serialize_datetime(dt):
    """Serialize datetime to ISO format string."""
    if dt:
        return dt.isoformat()
    return None


def deserialize_datetime(dt_str):
    """Deserialize ISO format string to datetime."""
    if dt_str:
        return datetime.fromisoformat(dt_str)
    return None


class APIException(Exception):
    """Custom API exception."""
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def handle_api_exception(func):
    """Decorator to handle API exceptions."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except APIException as e:
            return format_response(False, error=e.message, status_code=e.status_code)
        except Exception as e:
            logger.error(f"Unhandled exception in {func.__name__}: {str(e)}")
            return format_response(False, error="Internal server error", status_code=500)
    return wrapper
