from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Section
from ..serializers import SectionSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class SectionListView(APIView):
    @swagger_auto_schema(
        responses={
            200: openapi.Response('OK', SectionSerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        sections = Section.objects.all()
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=SectionSerializer,
        responses={
            201: openapi.Response('Created', SectionSerializer),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        serializer = SectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SectionDetailView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('sectionId', openapi.IN_QUERY, description="ID of the section", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={
            200: openapi.Response('OK', SectionSerializer),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        section_id = request.query_params.get('sectionId')
        if section_id:
            section = Section.objects.filter(s_id=section_id).first()
            if section:
                serializer = SectionSerializer(section)
                return Response(serializer.data)
            return Response({"detail": "Section not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "sectionId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter('sectionId', openapi.IN_QUERY, description="ID of the section", type=openapi.TYPE_INTEGER, required=True),
        ],
        responses={
            204: openapi.Response('No Content'),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def delete(self, request):
        section_id = request.query_params.get('sectionId')
        if section_id:
            section = Section.objects.filter(s_id=section_id).first()
            if section:
                section.delete()
                return Response({"detail": "Section deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
            return Response({"detail": "Section not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "sectionId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    