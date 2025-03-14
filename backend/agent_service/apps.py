import os
from django.apps import AppConfig
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class AgentServiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "agent_service"

    openai_client = None

    def ready(self):
        if not AgentServiceConfig.openai_client:
            print("Loading OpenAI client...")
            OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
            AgentServiceConfig.openai_client = OpenAI(api_key = OPENAI_API_KEY)
            print("OpenAI client loaded successfully!")
