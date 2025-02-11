from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from scipy.signal import resample
from agent_service.apps import AgentServiceConfig
from django.conf import settings
import os
# from ..agent import Agent

# helper
def resample_audio(audio, sample_rate, target_sample_rate=16000):
    num_samples = int(len(audio) * float(target_sample_rate) / sample_rate)
    resampled = resample(audio, num_samples)
    return resampled

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_prompt': openapi.Schema(type=openapi.TYPE_STRING, description='User input prompt. Required.'),
            'audio_id': openapi.Schema(type=openapi.TYPE_STRING, description='The id of the audio file. Optional.'),
        },
        required=[],
    ),
    responses={
        200: openapi.Response('OK'),
        400: openapi.Response('Bad Request'),
    }
)
@api_view(['POST'])
def pipeline(request):
    try:
        data = request.data
        user_prompt = data.get('user_prompt')
        audio_id = data.get('audio_id')

        if not user_prompt and not audio_id:
            return Response({"error": "User prompt or voice file is required"}, status=status.HTTP_400_BAD_REQUEST)

        processed_prompt = ""

        if user_prompt:
            processed_prompt += "[TEXT]: " + user_prompt + "\n" 
        
        if audio_id:
            model = AgentServiceConfig.whispher_model
            file_path = os.path.join(os.path.dirname(settings.BASE_DIR), "tmp", audio_id)
            transcription = model.transcribe(file_path)["text"]

            processed_prompt += "[AUDIO]: " + transcription + "\n"

        # Agent.start(processed_prompt)
        return Response({"message": "Data processed successfully", "data": processed_prompt}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    