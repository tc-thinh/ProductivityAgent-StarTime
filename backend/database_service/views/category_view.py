from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models import Category
from database_service.serializers import CategorySerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class CategoryListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'active',
                openapi.IN_QUERY,
                description="Filter to only get active categories if set to True",
                type=openapi.TYPE_BOOLEAN,
                required=False
            ),
        ],
        responses={
            200: openapi.Response('OK', CategorySerializer(many=True)),
            404: openapi.Response('Not Found'),
            400: openapi.Response('Bad Request'),
        }
    )
    def get(self, request):
        active = request.query_params.get('active')
        if active is not None and active.lower() == 'true':
            categories = Category.objects.filter(cat_active=True)
        else:
            categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'categoryId', 
                openapi.IN_QUERY, 
                description="ID of the category to modify", 
                type=openapi.TYPE_INTEGER, 
                required=True
            ),
        ],
        request_body=CategorySerializer,
        responses={
            200: openapi.Response('OK', CategorySerializer),
            400: openapi.Response('Bad Request'),
            404: openapi.Response('Not Found'),
        }
    )
    def put(self, request):
        category_id = request.query_params.get('categoryId')
        if not category_id:
            return Response({"detail": "categoryId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            category = Category.objects.get(cat_id=category_id)
        except Category.DoesNotExist:
            return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    