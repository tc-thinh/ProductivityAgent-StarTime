import json
from database_service.models import Conversation
from database_service.serializers import ConversationSerializer
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from threading import Lock

# Create a lock to ensure thread safety during updates
conversation_lock = Lock()

class ConversationUpdatesWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the section ID from the URL route
        self.conversation_id = self.scope['url_route']['kwargs']['conversationId']
        self.group_name = f'Conversation_{self.conversation_id}'

        # Fetch the conversation object asynchronously
        self.conversation = await sync_to_async(Conversation.objects.filter(c_id=self.conversation_id).first)()

        if not self.conversation:
            print(f"Connection rejected: conversation {self.conversation_id} does not exist")
            await self.close()  # Reject connection
            return

        print(f"Connected to conversation: {self.conversation_id}")

        # Add the client to the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Send initial conversation data
        self.conversation_messages = self.conversation.c_messages
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',  # Calls `chat_message` handler
                'message': {
                    'type': 'conversation',
                    'message': ConversationSerializer(self.conversation).data
                }
            }
        )

    async def disconnect(self, close_code):
        # Remove the client from the group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Process received data (expected to be JSON)
        data = json.loads(text_data)

        if data.get('type') == 'conversation_name':
            # Change conversation name (c_name)
            new_name = data.get('message')
            # Ensure thread safety by acquiring the lock before updating the conversation
            with conversation_lock:
                self.conversation.c_name = new_name
                await self._update_conversation()

        elif data.get('type') == 'conversation_message':
            # Add new message to conversation
            with conversation_lock:
                self.conversation_messages.append(data.get('message'))
                await self._update_conversation()

        # Send the updated message to the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': data
            }
        )

    async def chat_message(self, event):
        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'data': event['message']
        }))

    @sync_to_async
    def _update_conversation(self):
        """
        Update the conversation object in the database with new messages or name.
        The conversation object is updated after acquiring the lock for thread safety.
        """
        # Ensure that the conversation is updated in the DB
        self.conversation.c_messages = self.conversation_messages
        self.conversation.save()
