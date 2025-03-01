import json
from database_service.models import Message
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

class ConversationUpdatesWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the section ID from the URL route
        self.conversation_id = self.scope['url_route']['kwargs']['conversationId']
        self.group_name = f'Conversation_{self.conversation_id}'
        
        # Print the section ID
        print(f"Connected to conversation: {self.conversation_id}")

        # Add the client to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        # Query the database for messages that contain the conversation Id
        messages = await sync_to_async(list)(Message.objects.filter(c_id=self.conversation_id))

        # Send the prompts to the client
        for message in messages:
            await self.send(text_data=json.dumps({
                'conversation_id': self.conversation_id,
                'role': message.m_role,
                'content': message.m_content,
                'tool_calls': None,
                'tool_call_id': None
            }))

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
                'conversation_id': self.conversation_id,
                'message': data.get('message')
            }
        )

    async def chat_message(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'conversation_id': event['conversation_id'],
            'message': event['message']
        }))
        