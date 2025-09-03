# backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import inventory.routing
from inventory.middleware import TokenAuthMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware( # <-- Wrap the AuthMiddlewareStack
        AuthMiddlewareStack(
            URLRouter(
                inventory.routing.websocket_urlpatterns
            )
        )
    ),
})