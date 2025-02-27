from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Prompt
from ..serializers import PromptSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class PromptListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('sectionId', openapi.IN_QUERY, description="ID of the section", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={
            200: openapi.Response('OK', PromptSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        section_id = request.query_params.get('sectionId')
        if section_id:
            prompts = Prompt.objects.filter(s_id=section_id)
            if prompts.exists():
                serializer = PromptSerializer(prompts, many=True)
                return Response(serializer.data)
            return Response({"detail": "Prompts not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "sectionId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=PromptSerializer,
        responses={
            201: openapi.Response('Created', PromptSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = PromptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    