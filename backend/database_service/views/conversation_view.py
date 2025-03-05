from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Conversation
from ..serializers import ConversationSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ConversationListView(APIView):
    @swagger_auto_schema(
        responses={
            200: openapi.Response('OK', ConversationSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        conversations = Conversation.objects.filter(c_deleted=False).order_by('-c_created_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=ConversationSerializer,
        responses={
            201: openapi.Response('Created', ConversationSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        # create default conversation
        if not request.data:
            conversation = Conversation.objects.create()
            serializer = ConversationSerializer(conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        serializer = ConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        request_body=ConversationSerializer,
        manual_parameters=[
            openapi.Parameter(
                'conversationId',
                openapi.IN_QUERY,  
                description="Conversation ID to update",
                type=openapi.TYPE_INTEGER, 
                required=True
            ),
        ],
        responses={
            200: openapi.Response('OK', ConversationSerializer),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def put(self, request):
        try:
            conversation_id = request.query_params.get('conversationId')
            conversation = Conversation.objects.get(c_id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ConversationSerializer(conversation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
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
        responses={
            200: openapi.Response('OK', ConversationSerializer),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def delete(self, request):
        try:
            conversation_id = request.query_params.get('conversationId')
            conversation = Conversation.objects.get(c_id=conversation_id)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found"}, status=status.HTTP_404_NOT_FOUND)

        conversation.c_deleted = True
        conversation.save()
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)
