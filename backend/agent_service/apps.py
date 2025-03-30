import os
from django.apps import AppConfig
from dotenv import load_dotenv
from openai import OpenAI
from langfuse import Langfuse
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class AgentServiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "agent_service"

    openai_client = None
    langfuse_client = None

    def ready(self):
        if not AgentServiceConfig.openai_client:
            logger.info("Loading OpenAI client...")
            OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
            AgentServiceConfig.openai_client = OpenAI(api_key = OPENAI_API_KEY)
            logger.info("OpenAI client loaded successfully!")

        if not AgentServiceConfig.langfuse_client:
            logger.info("Loading Langfuse client...")
            LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY") 
            LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")
            LANGFUSE_HOST = os.getenv("LANGFUSE_HOST")

            AgentServiceConfig.langfuse_client = Langfuse()
            logger.info("Langfuse client loaded successfully!")
