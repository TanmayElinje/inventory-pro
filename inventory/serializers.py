# inventory/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Supplier, Category, Product, StockMovement
from .tasks import get_sales_forecast
from .models import ProductImage
from django.contrib.auth.models import Group
from django.conf import settings

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

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    code = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'code']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "A user with that email already exists."})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        code = validated_data['code']
        group_name = None
        if code == settings.ADMIN_CODE:
            group_name = 'Admin'
        elif code == settings.MANAGER_CODE:
            group_name = 'Manager'
        elif code == settings.STAFF_CODE:
            group_name = 'Staff'
        else:
            user.delete() # Prevent user creation with invalid code
            raise serializers.ValidationError({"code": "Invalid role code provided."})

        if group_name:
            # Ensure all groups exist before assigning
            Group.objects.get_or_create(name='Admin')
            Group.objects.get_or_create(name='Manager')
            Group.objects.get_or_create(name='Staff')
            
            group = Group.objects.get(name=group_name)
            user.groups.add(group)

        return user