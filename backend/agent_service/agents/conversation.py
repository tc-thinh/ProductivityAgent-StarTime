from typing import List

from agent_service.toolbox.services.conversations import *
from app_lib.utils.conversations import fetch_previous_messages
from app_lib.utils.users import fetch_user

import asyncio
import threading
from datetime import datetime

class OnGoingConversation:
    def __init__(   
            self, 
            user_id: str, 
            message: str, 
            images: List[str], 
            conversation_id: str = None,
            iana_timezone: str = "UTC",
        ):
        if conversation_id is None:
            conversation_id = create_blank_conversation(user)

            thread = threading.Thread(
                target=self._naming_agent,
                args=(message, user_id, images, conversation_id),
                daemon=True
            )
            thread.start()

        user = fetch_user(user_id)
        self.conversation_id = conversation_id

        self.user = user
        self.new_message = self._construct_message(message, images)

        self.iana_timezone = iana_timezone
        # self.last_message_time = datetime.now()

    def process(self):
        """Process the conversation."""
        pass

    def _naming_agent(self, user_request: str, images: List[str], conversation_id: str) -> str:
        """Get the conversation name using the naming agent."""

        conversation_name = get_conversation_name(user_request, images)
        asyncio.run(update_conversation(conversation_id, conversation_name))
        return conversation_name
    
    def _fetch_previous_messages(self, conversation_id: str) -> List[dict]:
        """Fetch previous messages from the database."""
        return fetch_previous_messages(conversation_id)
    
    def _construct_message(self, message: str, images: List[str]) -> dict:
        """Construct the message to be sent."""
        message_content = [{"type": "text", "text": message}]
        if images:
            for image_string in images:
                message_content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"{image_string}",
                    },
                })

        return {
            "role": "user",
            "content": message_content
        }
