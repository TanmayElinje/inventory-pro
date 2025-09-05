# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "message": "InventoryPro API is running 🚀",
        "endpoints": {
            "admin": "/admin/",
            "api": "/api/",
            "auth_token": "/api/token/"
        }
    })


urlpatterns = [
    path('', home, name='home'),  # 👈 root route add kiya
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
