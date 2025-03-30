import logging
from database_service.models.conversations import Conversation

logger = logging.getLogger(__name__)

def fetch_previous_messages(conv_id: int):
    try:
        # Fetch the conversation by its ID
        conversation = Conversation.objects.get(c_id=conv_id)
        if conversation:
            return conversation.c_messages
        else:
            logger.error(f"No conversation found with ID: {conv_id}")
            return []
    except Exception as e:
        logger.error(f"Error fetching conversation with ID {conv_id}: {e}")
        return []
