# inventory/admin.py

from django.contrib import admin
from .models import Supplier, Category, Product

admin.site.register(Supplier)
admin.site.register(Category)
admin.site.register(Product)