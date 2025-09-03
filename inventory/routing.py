# inventory/routing.py
from django.urls import re_path
from . import consumers

# The original path might have been too loose.
# Let's make it more specific.
websocket_urlpatterns = [
    re_path(r'^ws/products/$', consumers.ProductConsumer.as_asgi()),
]