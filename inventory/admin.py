# inventory/admin.py

from django.contrib import admin
from .models import Supplier, Category, Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]

admin.site.register(Supplier)
admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductImage)
