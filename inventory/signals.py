# inventory/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Product
from .serializers import ProductSerializer

@receiver(post_save, sender=Product)
def broadcast_product_update(sender, instance, **kwargs):
    """
    Broadcasts product updates to the 'products_group' channel,
    ensuring related data is fully serialized.
    """
    
    # ✅ Re-fetch the instance with related fields to ensure data consistency
    product = Product.objects.select_related('category', 'supplier').get(pk=instance.pk)
    
    channel_layer = get_channel_layer()
    serializer = ProductSerializer(product)
    
    async_to_sync(channel_layer.group_send)(
        'products_group',
        {
            'type': 'product_update',
            'product': serializer.data
        }
    )