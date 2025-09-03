# inventory/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, CategoryViewSet, ProductViewSet, CurrentUserView,
    DashboardAnalyticsView, StockMovementViewSet # Import StockMovementViewSet
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stock-movements', StockMovementViewSet) # Register the new ViewSet

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    # Add this path for the current user
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
]