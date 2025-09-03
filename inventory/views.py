# inventory/views.py

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Sum, F, Count, DecimalField
from django.db.models.functions import Coalesce
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Supplier, Category, Product
from .serializers import SupplierSerializer, CategorySerializer, ProductSerializer
from .serializers import UserSerializer
from .models import StockMovement
from .serializers import StockMovementSerializer
from django.db import transaction # Import transaction
from rest_framework.decorators import action # Import action

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def adjust_stock(self, request, pk=None):
        """
        Custom action to adjust a product's stock and log the movement.
        """
        product = self.get_object()
        quantity_change = request.data.get('quantity_change')
        reason = request.data.get('reason', 'Manual adjustment')

        if quantity_change is None:
            return Response({'error': 'quantity_change is required'}, status=400)

        try:
            quantity_change = int(quantity_change)
        except ValueError:
            return Response({'error': 'quantity_change must be an integer'}, status=400)

        if product.quantity + quantity_change < 0:
            return Response({'error': 'Stock cannot go below zero'}, status=400)

        # Create the log entry
        StockMovement.objects.create(
            product=product,
            quantity_change=quantity_change,
            reason=reason,
            user=request.user
        )

        # Update the product's quantity
        product.quantity += quantity_change
        product.save()

        # Return the updated product data
        serializer = self.get_serializer(product)
        return Response(serializer.data)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # --- THIS IS THE CORRECTED PART ---
        total_inventory_value = Product.objects.aggregate(
            total_value=Coalesce(
                Sum(F('quantity') * F('sale_price'), output_field=DecimalField()), 
                0,
                output_field=DecimalField()
            )
        )['total_value']

        # Total number of products
        total_products = Product.objects.count()

        # Count of low-stock items
        low_stock_items = Product.objects.filter(quantity__lte=F('reorder_point')).count()

        # Product count by category for the chart
        category_distribution = (
            Product.objects.values('category__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        data = {
            'total_inventory_value': total_inventory_value,
            'total_products': total_products,
            'low_stock_items': low_stock_items,
            'category_distribution': list(category_distribution),
        }
        return Response(data)
    
class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing stock movement history.
    Read-only because movements are created via the ProductViewSet adjust_stock action.
    """
    queryset = StockMovement.objects.all().order_by('-timestamp')
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['product'] # Allow filtering by product_id