from agent_service.apps import AgentServiceConfig
import os
import requests
from agent_service.clients.conversation_ws import DBConversationWebSocketClient
import logging
from agent_service.apps import AgentServiceConfig
from typing import List

openai_client = AgentServiceConfig.openai_client
langfuse_client = AgentServiceConfig.langfuse_client
MODEL = os.getenv('OPENAI_LLM_SMALL')
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

# Initialize logging
logger = logging.getLogger(__name__)

def get_conversation_name(user_request: str, images: List[str]) -> str:
    prompt = langfuse_client.get_prompt("NamingAgent_SystemContext", type="chat")
    messages = prompt.compile(
        initial_request=user_request
    )
    logger.info(f"{messages}")

    if images:
        for image_string in images:
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"{image_string}"
                        }
                    }
                ]
            })

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=messages,
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
        logger.error(f"Update conversation name failed: {e}", exc_info=True)
        raise

def create_blank_conversation(user):
    conversation = requests.post(
        DATABASE_SERVICE_URL + "/conversations/",
        json={
            "token": str(user.u_id)  # Convert UUID to string
        }
    ).json()
    return conversation.get('c_id')
