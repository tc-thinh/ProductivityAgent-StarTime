import logging
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from scipy.signal import resample
from agent_service.apps import AgentServiceConfig
from django.conf import settings
import os
from agent_service.toolbox.agent import start_agent_action
from agent_service.toolbox.services.conversations import *
import threading
from rest_framework.views import APIView

logger = logging.getLogger(__name__)
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

def resample_audio(audio, sample_rate, target_sample_rate=16000):
    num_samples = int(len(audio) * float(target_sample_rate) / sample_rate)
    resampled = resample(audio, num_samples)
    return resampled

def process(data: dict, conversation_id: int):
    logger.info("Starting new process.")
    try:
        user_prompt = data.get('userPrompt')
        audio_id = data.get('audioId')

        if not user_prompt and not audio_id:
            logger.error("User prompt or voice file is required")
            return

        processed_prompt = ""

        if user_prompt:
            processed_prompt += "[TEXT]: " + user_prompt + "\n" 
        
        if audio_id:
            try:
                model = AgentServiceConfig.whispher_model
                file_path = os.path.join(settings.BASE_DIR, "tmp", audio_id)
                transcription = model.transcribe(file_path)["text"]
                processed_prompt += "[AUDIO]: " + transcription + "\n"
            except Exception as e:
                logger.error(f"Error transcribing audio: {str(e)}")
                raise

        c_name = get_conversation_name(processed_prompt)
        update_conversation(conversation_id, c_name)

        def process_conversation():
            try:
                process_thread = threading.Thread(
                    target=start_agent_action,
                    args=(processed_prompt, conversation_id),
                    daemon=True
                )
                process_thread.start()
            except Exception as e:
                logger.error(f"Error in agent_action: {str(e)}")

        conversation_thread = threading.Thread(target=process_conversation)
        conversation_thread.start()

    except Exception as e:
        logger.error(f"Error in process: {str(e)}")
        raise

class AgentView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'userPrompt': openapi.Schema(type=openapi.TYPE_STRING, description='User input prompt.'),
                'audioId': openapi.Schema(type=openapi.TYPE_STRING, description='The id of the audio file.'),
            },
        ),
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def post(self, request, *args, **kwargs):
        try:
            conversation_id = create_blank_conversation()
            logger.info(f"Created conversation {conversation_id}")
            # Pass data as a dictionary to avoid QueryDict issues
            data = request.data.dict() if hasattr(request.data, 'dict') else request.data
            process_thread = threading.Thread(
                target=process,
                args=(data, conversation_id),
                daemon=True
            )
            process_thread.start()
            return Response({
                "message": "Processing started",
                "conversationId": conversation_id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in post: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        