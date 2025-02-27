# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MyWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Clean up when the socket disconnects
        pass

    async def receive(self, text_data):
        # Process the received data (assumed to be JSON)
        data = json.loads(text_data)
        # For example, echo the message back
        await self.send(text_data=json.dumps({
            'message': f"Echo: {data.get('message')}"
        }))
    