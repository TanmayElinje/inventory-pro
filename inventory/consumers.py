# inventory/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProductConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'products_group'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def product_update(self, event):
        product_data = event['product']
        await self.send(text_data=json.dumps({
            'type': 'product_update',
            'product': product_data
        }))
