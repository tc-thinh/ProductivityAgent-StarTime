import logging
from rest_framework import status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import os
from agent_service.toolbox.agent import start_agent_action
from agent_service.toolbox.services.conversations import *
import threading
from rest_framework.views import APIView
import asyncio
from app_lib.utils.users import fetch_user

logger = logging.getLogger(__name__)
DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL')

def process(data: dict, conversation_id: int, create_new: bool = True):
    logger.info("Starting new process.")
    try:
        user_prompt = data.get('userPrompt')
        user_token = data.get('token')
        images = data.get('images')
        processed_prompt = ""

        if user_prompt:
            processed_prompt += "[TEXT]: " + user_prompt + "\n" 
        
        def conversation_naming():
            try:
                c_name = get_conversation_name(processed_prompt, images)
                logger.info(f"Conversation {conversation_id} name: {c_name}")
                # Call the async function using asyncio.run
                asyncio.run(update_conversation(conversation_id, c_name))
            except Exception as e:
                logger.error(f"Error in conversation naming: {str(e)}", exc_info=True)

        if create_new:
            converastion_naming_thread = threading.Thread(target=conversation_naming)
            converastion_naming_thread.start()

        def process_conversation():
            try:
                process_thread = threading.Thread(
                    target=start_agent_action,
                    args=(processed_prompt, images, user_token, conversation_id),
                    daemon=True
                )
                process_thread.start()
            except Exception as e:
                logger.error(f"Error in agent_action: {str(e)}", exc_info=True)

        conversation_thread = threading.Thread(target=process_conversation)
        conversation_thread.start()

    except Exception as e:
        logger.error(f"Error in process: {str(e)}", exc_info=True)
        raise

class AgentView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'userPrompt': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='User input prompt.'
                ),
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User identification token'
                ),
                'images': openapi.Schema(
                    type=openapi.TYPE_ARRAY, 
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    description='List of base64 images.'
                )
            },
        ),
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def post(self, request, *args, **kwargs):
        try:
            data = request.data.dict() if hasattr(request.data, 'dict') else request.data

            user = fetch_user(data.get("token"))
            if not user:
                return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)
            
            if not data.get("userPrompt"):
                return Response({"error": "User prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

            conversation_id = create_blank_conversation(user)
            logger.info(f"Created conversation {conversation_id}")
            
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
            logger.error(f"Error in post: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class AgentMessageView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'userPrompt': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='New user input prompt.'
                ),
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User identification token'
                ),
                'images': openapi.Schema(
                    type=openapi.TYPE_ARRAY, 
                    items=openapi.Items(type=openapi.TYPE_STRING),
                    description='List of base64 images.'
                ),
                'conversationId': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='Current Conversation ID'
                )
            },
        ),
        responses={200: 'OK', 400: 'Bad Request'}
    )
    def post(self, request, *args, **kwargs):
        try:
            data = request.data.dict() if hasattr(request.data, 'dict') else request.data

            user = fetch_user(data.get("token"))
            if not user:
                return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)

            if not data.get("userPrompt"):
                return Response({"error": "User prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

            if not data.get("conversationId"):
                return Response({"error": "Conversation ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            conversation_id = data.get("conversationId")
            logger.info(f"New message in conversation {conversation_id}")
            
            process_thread = threading.Thread(
                target=process,
                args=(data, conversation_id, False),
                daemon=True
            )
            process_thread.start()
            return Response({
                "message": "Processing started"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in post: {str(e)}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
