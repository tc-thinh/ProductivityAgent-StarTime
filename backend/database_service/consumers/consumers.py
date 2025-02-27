import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SectionUpdatesWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the section ID from the URL route
        self.section_id = self.scope['url_route']['kwargs']['id']
        self.group_name = f'section_{self.section_id}'
        
        # Print the section ID
        print(f"Connected to section ID: {self.section_id}")

        # Add the client to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the client from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Process the received data (assumed to be JSON)
        data = json.loads(text_data)
        
        # Send the message to the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'section_id': self.section_id,
                'message': data.get('message')
            }
        )

    async def chat_message(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'section_id': event['section_id'],
            'message': event['message']
        }))
        