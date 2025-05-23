import logging
import json
from database_service.models import Conversation
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db import transaction
from database_service.serializers import ConversationSerializer
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

class ConversationUpdatesWebSocket(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract the section ID from the URL route
        self.conversation_id = self.scope['url_route']['kwargs']['conversationId']
        self.group_name = f'Conversation_{self.conversation_id}'

        exists = await sync_to_async(Conversation.objects.filter(c_id=self.conversation_id).exists)()
        if not exists:
            logger.error(f"Conversation {self.conversation_id} does not exist.", exc_info=True)
            await self.close()
            return
        
        await self.accept()
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        try:
            conversation = await sync_to_async(self._get_conversation)()
            serialized = ConversationSerializer(conversation).data
            await self.send(text_data=json.dumps({
                'data': serialized
            }))
        except Exception as e:
            logger.error(f"Error sending initial data: {str(e)}", exc_info=True)
        
    def _get_conversation(self):
        try:
            return Conversation.objects.get(c_id=self.conversation_id, c_deleted=False)
        except Conversation.DoesNotExist:
            logger.error(f"Conversation {self.conversation_id} does not exist.", exc_info=True)
            asyncio.run(self.close())
            return None

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
            await self._handle_name_update(data["message"]["c_name"])
        elif data.get('type') == 'conversation_message':
            await self._handle_message_update(data["message"])

        await self._broadcast_update()

    async def _handle_name_update(self, new_name):
        await sync_to_async(self._update_name_in_db)(new_name)

    def _update_name_in_db(self, new_name):
        with transaction.atomic():
            conversation = Conversation.objects.select_for_update().get(c_id=self.conversation_id)
            conversation.c_name = new_name
            conversation.save()

    async def _handle_message_update(self, new_messages):
        await sync_to_async(self._update_messages_in_db)(new_messages)

    def _update_messages_in_db(self, new_message):
        with transaction.atomic():
            raw_message = ""
            try:
                message_content = new_message.get("content", "")
                if type(message_content) == list:
                    raw_message = message_content[0].get("text", "")
                elif type(message_content) == str:
                    raw_message = message_content

            except (IndexError, KeyError):
                logger.error(f"Error extracting raw message from new message: {new_message}", exc_info=True)

            conversation = Conversation.objects.select_for_update().get(c_id=self.conversation_id)
            conversation.c_rawmessages += raw_message + "\n"
            conversation.c_messages.append(new_message)
            conversation.save()

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'data': event['message']
            }))
        except Exception as e:
            logger.error(f"Error sending chat message: {str(e)}", exc_info=True)

    async def _broadcast_update(self):
        conversation = await sync_to_async(self._get_conversation)()
        serialized = ConversationSerializer(conversation).data
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': serialized
            }
        )
