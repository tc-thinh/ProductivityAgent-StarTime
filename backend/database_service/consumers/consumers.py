import json
from database_service.models import Conversation
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

class ConversationUpdatesWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the section ID from the URL route
        self.conversation_id = self.scope['url_route']['kwargs']['conversationId']
        self.group_name = f'Conversation_{self.conversation_id}'
        
        self.conversation = await sync_to_async(Conversation.objects.filter(c_id=self.conversation_id).first)()
        if not self.conversation:
            print(f"Connection rejected: conversation {self.conversation_id} does not exist")
            await self.close()  # Reject connection
            return

        # Print the section ID
        print(f"Connected to conversation: {self.conversation_id}")

        # Add the client to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the connection
        await self.accept()

        self.conversation_messages = self.conversation.c_messages  
        await self.send(text_data=json.dumps(self.conversation_messages))

    async def disconnect(self, close_code):
        # Remove the client from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        if self.conversation:
            await sync_to_async(self._update_conversation_messages)()

    def _update_conversation_messages(self):
        """Sync method to update conversation messages in the database."""
        self.conversation.c_messages = self.conversation_messages 
        self.conversation.save()

    async def receive(self, text_data):
        # Process the received data (assumed to be JSON)
        # data {'type': 'conversation_name'/'message', 'data': 'JSON'}
        data = json.loads(text_data)
        if data.get('type') != 'conversation_name':
            self.conversation_messages.append(data.get('message'))

        # Send the message to the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'conversation_id': self.conversation_id,
                'message': data
            }
        )

    async def chat_message(self, event):
        # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'conversation_id': event['conversation_id'],
            'message': event['message']
        }))
        