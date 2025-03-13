from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models.KVStore import SqliteKVStore
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import json

class AuthView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'access_token': openapi.Schema(type=openapi.TYPE_STRING, description='Google access token'),
                'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description='Google refresh token'),
                'expires_in': openapi.Schema(type=openapi.TYPE_INTEGER, description='Token expiration time in seconds'),
                'scope': openapi.Schema(type=openapi.TYPE_STRING, description='Token scope'),
                'token_type': openapi.Schema(type=openapi.TYPE_STRING, description='Token type'),
            },
            required=['access_token', 'refresh_token', 'expires_in', 'scope', 'token_type']
        ),
        responses={
            200: openapi.Response('OK'),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        try:
            data = request.data

            # Save the data to KVStore
            kv_store = SqliteKVStore(namespace="auth")
            kv_store.set('GoogleAuthToken', data)
            return Response({"message": "Google Authentication tokens saved successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        