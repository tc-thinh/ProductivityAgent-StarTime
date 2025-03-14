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
                "role": "system",
                "content": """
                            You are a conversation naming agent for an event and task scheduling application. 
                            Your goal is to generate a clear, concise, and informative name that summarizes the conversation context accurately.
                            
                            Examples of well-formed conversation names:
                            - Meeting with Mia @ 4pm
                            - CSE 463 Mid-term exam
                            - CSE 412 Project 2 deadline
                            - Elastic Search Service for Project StarTime
                            
                            Keep the name short and to the point while retaining key details such as time, participants, or task focus.
                            """
            },
            {
                "role": "user",
                "content": f"Generate a short, clear conversation name based on this context:\n{prompt}"
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
        logger.error(f"Update conversation name failed: {e}", exc_info=True)
        raise

def create_blank_conversation():
    conversation = requests.post(DATABASE_SERVICE_URL + "/conversations/").json()
    return conversation.get('c_id')
