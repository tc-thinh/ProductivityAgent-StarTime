from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from scipy.signal import resample
from agent_service.apps import AgentServiceConfig
from django.conf import settings
import os
from agent_service.toolbox.agent import agent_action
from agent_service.toolbox.services.conversations import *
import threading
from rest_framework.views import APIView

DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

# helper
def resample_audio(audio, sample_rate, target_sample_rate=16000):
    num_samples = int(len(audio) * float(target_sample_rate) / sample_rate)
    resampled = resample(audio, num_samples)
    return resampled

def process(data: dict, conversation_id: int):
    user_prompt = data.get('user_prompt')
    audio_id = data.get('audio_id')

    if not user_prompt and not audio_id:
        return Response({"error": "User prompt or voice file is required"}, status=status.HTTP_400_BAD_REQUEST)

    processed_prompt = ""

    if user_prompt:
        processed_prompt += "[TEXT]: " + user_prompt + "\n" 
    
    if audio_id:
        model = AgentServiceConfig.whispher_model
        file_path = os.path.join(settings.BASE_DIR, "tmp", audio_id)
        transcription = model.transcribe(file_path)["text"]
        processed_prompt += "[AUDIO]: " + transcription + "\n"

    # Get conversation name
    c_name = get_conversation_name(processed_prompt)
    update_conversation(conversation_id, c_name)

    # Create a new thread to process the conversation
    def process_conversation():
        agent_action(processed_prompt, conversation_id)

    conversation_thread = threading.Thread(target=process_conversation)
    conversation_thread.start()

class AgentView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'user_prompt': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='User input prompt. Required.'
                ),
                'audio_id': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='The id of the audio file. Optional.'
                ),
            },
            required=[],  
        ),
        responses={
            200: openapi.Response('OK'),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request, *args, **kwargs):
        try:
            # Create a new conversation record.
            conversation_id = create_blank_conversation()
            
            # Start processing in a new thread.
            process_thread = threading.Thread(target=process, args=(request.data, conversation_id))
            process_thread.start()
            
            return Response({
                "message": "Data processed successfully", 
                "conversationId": conversation_id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
