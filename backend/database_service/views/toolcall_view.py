from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models import ToolCall
from database_service.serializers import ToolCallSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class ToolCallListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'messageId', 
                openapi.IN_QUERY, 
                description="ID of the message", 
                type=openapi.TYPE_INTEGER, 
                required=True
            ),
        ],
        responses={
            200: openapi.Response('OK', ToolCallSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        message_id = request.query_params.get('messageId')
        if message_id:
            toolcalls = ToolCall.objects.filter(m_id=message_id)
            serializer = ToolCallSerializer(toolcalls, many=True)
            return Response(serializer.data)
        return Response({"detail": "messageId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=ToolCallSerializer,
        responses={
            201: openapi.Response('Created', ToolCallSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = ToolCallSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
