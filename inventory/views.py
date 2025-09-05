# inventory/views.py

from django.db import transaction
from django.db.models import Sum, F, Count, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, filters, parsers
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Supplier, Category, Product, StockMovement
from .serializers import (
    SupplierSerializer, CategorySerializer, ProductSerializer, 
    StockMovementSerializer, UserSerializer
)
from .tasks import get_sales_forecast
import qrcode
import io
from django.http import HttpResponse

# --- Pagination Class ---
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000

# --- ViewSets ---
class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'contact_info']

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    
    # --- THIS IS THE FIX ---
    # Add JSONParser to the list of parsers
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'sku', 'category__name']
    filterset_fields = {
        'sale_price': ['gt', 'lt'],
        'category': ['exact'], # <-- ADD THIS LINE
    }

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        quantity_change = request.data.get('quantity_change')
        reason = request.data.get('reason', 'Manual adjustment')
        if quantity_change is None: return Response({'error': 'quantity_change is required'}, status=400)
        try: quantity_change = int(quantity_change)
        except ValueError: return Response({'error': 'quantity_change must be an integer'}, status=400)
        if product.quantity + quantity_change < 0: return Response({'error': 'Stock cannot go below zero'}, status=400)
        StockMovement.objects.create(product=product, quantity_change=quantity_change, reason=reason, user=request.user)
        product.quantity += quantity_change
        product.save()
        serializer = self.get_serializer(product)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StockMovement.objects.all().order_by('-timestamp')
        product_id = self.request.query_params.get('product')
        if product_id is not None:
            queryset = queryset.filter(product_id=product_id)
        return queryset

# --- API Views ---
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# inventory/views.py

import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from inventory.models import Supplier, Category, Product, StockMovement, ProductImage
from django.db import transaction
from tqdm import tqdm
from django.conf import settings
from django.db.models.functions import TruncDate


class Command(BaseCommand):
    help = 'Seeds the database with data from the product_images.json file'

    def handle(self, *args, **kwargs):
        # ... (rest of the file is the same)
        pass

# --- UPDATED DashboardAnalyticsView ---
class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        time_range = request.query_params.get('range', 'all')

        if time_range == 'all':
            sales_movements = StockMovement.objects.filter(quantity_change__lt=0)
        else:
            try:
                days = int(time_range)
                start_date = timezone.now() - timedelta(days=days)
                sales_movements = StockMovement.objects.filter(
                    timestamp__gte=start_date,
                    quantity_change__lt=0
                )
            except ValueError:
                sales_movements = StockMovement.objects.filter(quantity_change__lt=0)
        
        # --- These charts are all time-filtered ---
        sales_trend = sales_movements.annotate(day=TruncDate('timestamp')).values('day').annotate(total_revenue=Sum(F('quantity_change') * F('product__sale_price') * -1, output_field=DecimalField())).order_by('day')
        top_selling_products = sales_movements.values('product__name').annotate(units_sold=Sum('quantity_change') * -1).order_by('-units_sold')[:5]
        revenue_by_category = sales_movements.values('product__category__name').annotate(total_revenue=Sum(F('quantity_change') * F('product__sale_price') * -1, output_field=DecimalField())).order_by('-total_revenue')

        # --- THIS QUERY IS NOW CORRECT AND DYNAMIC ---
        category_distribution = sales_movements.values('product__category__name') \
            .annotate(count=Count('product', distinct=True)) \
            .order_by('-count')

        # --- These stats remain "All Time" ---
        total_inventory_value = Product.objects.aggregate(total_value=Coalesce(Sum(F('quantity') * F('sale_price'), output_field=DecimalField()), 0, output_field=DecimalField()))['total_value']
        total_products = Product.objects.count()
        low_stock_items = Product.objects.filter(quantity__lte=F('reorder_point')).count()
        
        data = {
            'total_inventory_value': total_inventory_value,
            'total_products': total_products,
            'low_stock_items': low_stock_items,
            'category_distribution': list(category_distribution),
            'sales_trend': list(sales_trend),
            'top_selling_products': list(top_selling_products),
            'revenue_by_category': list(revenue_by_category),
        }
        return Response(data)
    
# --- ADD THIS NEW FUNCTION AT THE END OF THE FILE ---
@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def product_qrcode_view(request, pk):
    """
    Generates and returns a QR code image for a given product's detail page.
    """
    try:
        # The data for the QR code will be the URL to the product on the frontend
        frontend_url = f"http://localhost:3000/products/{pk}"

        # Generate the QR code image
        qr_image = qrcode.make(frontend_url, box_size=10)

        # Save the image to an in-memory buffer
        buffer = io.BytesIO()
        qr_image.save(buffer, "PNG")
        buffer.seek(0)

        # Return the image as an HTTP response
        return HttpResponse(buffer, content_type="image/png")

    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    
# --- ADD THIS NEW, DEDICATED VIEW AT THE END OF THE FILE ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_selling_products_view(request):
    """
    Returns the top 5 selling products, filterable by time range and category.
    """
    time_range = request.query_params.get('range', '30')
    category_id = request.query_params.get('category', None)

    sales_movements = StockMovement.objects.filter(quantity_change__lt=0)

    if time_range != 'all':
        try:
            days = int(time_range)
            start_date = timezone.now() - timedelta(days=days)
            sales_movements = sales_movements.filter(timestamp__gte=start_date)
        except ValueError:
            pass 

    if category_id:
        sales_movements = sales_movements.filter(product__category_id=category_id)

    top_products = sales_movements.values('product__name') \
        .annotate(units_sold=Sum('quantity_change') * -1) \
        .order_by('-units_sold')[:5]
    
    return Response(list(top_products))
    