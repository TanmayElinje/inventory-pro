# inventory/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet, CategoryViewSet, ProductViewSet, CurrentUserView,
    DashboardAnalyticsView, StockMovementViewSet
)
from .views import product_qrcode_view
from .views import top_selling_products_view
from .views import RegisterView 
from .views import seed_db

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'stock-movements', StockMovementViewSet, basename='stock-movement')

# This is the corrected and complete urlpatterns list
urlpatterns = [
    path('', include(router.urls)),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('analytics/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('products/<int:pk>/qrcode/', product_qrcode_view, name='product-qrcode'),
    path('analytics/top-products/', top_selling_products_view, name='top-products'),
    path('register/', RegisterView.as_view(), name='register'),
    path('seed-db/', seed_db, name='seed-db'),
]