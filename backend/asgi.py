# backend/asgi.py

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from inventory.middleware import TokenAuthMiddleware
import inventory.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# --- THIS IS THE FIX ---
# This line ensures Django is fully initialized before any other imports
# that might depend on it (like models in your middleware).
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                inventory.routing.websocket_urlpatterns
            )
        )
    ),
})