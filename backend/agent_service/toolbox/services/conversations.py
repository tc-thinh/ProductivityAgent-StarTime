from agent_service.apps import AgentServiceConfig
import os
import requests
from agent_service.clients.conversation_ws import DBConversationWebSocketClient
import logging

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_CONVERSATION_NAMING_MODEL')
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

# Initialize logging
logger = logging.getLogger(__name__)

def get_conversation_name(prompt: str) -> str:
    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {
            "role": "user",
            "content": "Summarize the conversation in 5 words or fewer:\n" + prompt
            }
        ],
        temperature=0.0
    )
    return response.choices[0].message.content

async def update_conversation(conversation_id: int, conversation_name: str):
    try:
        async with DBConversationWebSocketClient(conversation_id) as ws_client:
            await ws_client.send_message(
                message_type='conversation_name',
                message={"c_name": conversation_name}
            )
    except Exception as e:
        logger.error("Update conversation name failed: %s", str(e))
        raise

def create_blank_conversation():
    conversation = requests.post(DATABASE_SERVICE_URL + "/conversations/").json()
    # print(conversation)
    return conversation.get('c_id')
