import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models import Conversation
from database_service.serializers import ConversationSerializer, ConversationHeaderSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from app_lib.utils.users import get_user_from_query_param, get_user_from_body

# Set up a logger for the API view
logger = logging.getLogger(__name__)

class ConversationListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'token',
                openapi.IN_QUERY,
                description="User identifier token",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response('OK', ConversationSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        user = get_user_from_query_param(request)
        if not user:
            return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)
        
        conversations = Conversation.objects.filter(c_deleted=False, u_id=user).order_by('-c_created_at')
        logger.info(f"Retrieved {conversations.count()} conversations for user {user}.")
        
        serializer = ConversationHeaderSerializer(conversations, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User identifier token'
                )
            },
            required=['token']
        ),
        responses={
            201: openapi.Response('Created', ConversationSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        user = get_user_from_body(request)
        if not user:
            return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create default conversation with the user's identifier
        conversation = Conversation.objects.create(u_id=user)
        logger.info(f"Created a new conversation for user {user}.")
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'conversationId',
                openapi.IN_QUERY,  
                description="Conversation ID to delete",
                type=openapi.TYPE_INTEGER, 
                required=True
            ),
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User identifier token'
            )},
            required=['token']
        ),
        responses={
            200: openapi.Response('OK', ConversationSerializer),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def delete(self, request):
        user = get_user_from_body(request)
        if not user:
            return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            conversation_id = request.query_params.get('conversationId')
            conversation = Conversation.objects.get(c_id=conversation_id)
            logger.info(f"Conversation {conversation_id} found for user {user}.")
        except Conversation.DoesNotExist:
            logger.error(f"Conversation with ID {conversation_id} not found for user {user}.")
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        conversation.c_deleted = True
        conversation.save()
        logger.info(f"Conversation {conversation_id} marked as deleted for user {user}.")
        
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
        