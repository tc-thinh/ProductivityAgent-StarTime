from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models import Message
from database_service.serializers import MessageSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class MessageListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('conversationId', openapi.IN_QUERY, description="ID of the conversation", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={
            200: openapi.Response('OK', MessageSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        conversation_id = request.query_params.get('conversationId')
        if conversation_id:
            messages = Message.objects.filter(c_id=conversation_id)
            if messages.exists():
                serializer = MessageSerializer(messages, many=True)
                return Response(serializer.data)
            return Response({"detail": "Message not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "conversationId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=MessageSerializer,
        responses={
            201: openapi.Response('Created', MessageSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = MessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    