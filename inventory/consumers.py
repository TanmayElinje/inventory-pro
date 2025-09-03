# inventory/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProductConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'products_group'
        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # This function is called when a message is sent from the backend (e.g., from a view)
    async def product_update(self, event):
        product_data = event['product']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'product_update',
            'product': product_data
        }))