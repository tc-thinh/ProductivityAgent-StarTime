from agent_service.apps import AgentServiceConfig
import os
import requests

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_CONVERSATION_NAMING_MODEL')
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

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

def update_conversation(conversation_id: int, conversation_name: str):
    c_name = {
        "c_name": conversation_name
    }

    response = requests.post(f"{DATABASE_SERVICE_URL}/conversations/?conversationId={conversation_id}", json=c_name)
    print(response.json())
    # return response.json()['s_id']

def create_blank_conversation():
    conversation = requests.post(DATABASE_SERVICE_URL + "/conversations/").json()
    return conversation.c_id
