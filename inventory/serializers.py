# inventory/serializers.py

from rest_framework import serializers
from .models import Supplier, Category, Product
from django.contrib.auth.models import User
from .models import StockMovement

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_info']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# --- UPDATE THIS SERIALIZER ---
class ProductSerializer(serializers.ModelSerializer):
    # On read, use the nested serializers
    category = CategorySerializer(read_only=True)
    supplier = SupplierSerializer(read_only=True)

    # On write, accept the primary key (ID)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier', write_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'supplier', 'cost_price',
            'sale_price', 'quantity', 'reorder_point', 'category_id', 'supplier_id'
        ]

class UserSerializer(serializers.ModelSerializer):
    # We want to show the group names, not just their IDs
    groups = serializers.StringRelatedField(many=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'groups']

class StockMovementSerializer(serializers.ModelSerializer):
    # Show the username instead of the user ID
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'quantity_change', 'reason', 'timestamp', 'user']