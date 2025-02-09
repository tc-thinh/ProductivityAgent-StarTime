import os
from django.apps import AppConfig
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from dotenv import load_dotenv
import whisper

load_dotenv()

class AgentServiceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "agent_service"

    whispher_model = None

    def ready(self):        
        if not AgentServiceConfig.whispher_model:
            print("Loading model...")
            WHISPER = os.getenv("WHISPER")
            
            AgentServiceConfig.whispher_model = whisper.load_model(WHISPER)

            print("Model loaded successfully!")
