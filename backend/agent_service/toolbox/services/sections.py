from agent_service.apps import AgentServiceConfig
import os
import requests

openai_client = AgentServiceConfig.openai_client
MODEL = os.getenv('OPENAI_CONVERSATION_NAMING_MODEL')
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

def get_section_name(prompt: str) -> str:
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

def create_section(section_name: str):
    new_section = {
        "s_name": section_name,
        "s_starred": False,
    }

    response = requests.post(DATABASE_SERVICE_URL + "/sections/", json=new_section)
    print(response.json())  # Debugging

    return response.json()['s_id']
