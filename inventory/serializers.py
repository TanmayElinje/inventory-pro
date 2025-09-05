# inventory/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Supplier, Category, Product, StockMovement
from .tasks import get_sales_forecast
from .models import ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_info']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image_url']

class ProductSerializer(serializers.ModelSerializer):
    # For reading, show the full nested object
    category = CategorySerializer(read_only=True)
    supplier = SupplierSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    # For writing, accept the ID
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier', write_only=True
    )

    # --- THIS IS THE KEY PART ---
    # A special field that gets its value from a custom method
    forecast = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'supplier', 'cost_price',
            'sale_price', 'quantity', 'reorder_point', 'category_id', 'supplier_id',
            'forecast', 'images' # Add 'forecast' to the list of fields
        ]
    
    # This method is called to populate the 'forecast' field
    def get_forecast(self, obj):
        # 'obj' is the Product instance.
        # We check the context to see if this is a 'detail' view ('retrieve')
        # or a 'list' view. We only run the forecast on the detail view for performance.
        view = self.context.get('view', None)
        if view and view.action == 'retrieve':
            return get_sales_forecast(obj.id)
        return None # Return nothing if it's the main product list

class StockMovementSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'quantity_change', 'reason', 'timestamp', 'user']

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'groups']