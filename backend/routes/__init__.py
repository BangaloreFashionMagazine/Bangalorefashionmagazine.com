# Routes module
from .auth import create_auth_routes
from .talents import create_talent_routes
from .admin import create_admin_routes
from .content import create_content_routes

__all__ = [
    'create_auth_routes',
    'create_talent_routes', 
    'create_admin_routes',
    'create_content_routes'
]
