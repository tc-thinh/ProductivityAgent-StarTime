from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from database_service.models import Category
from database_service.serializers import CategorySerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import logging
from app_lib.utils.users import get_user_from_query_param, fetch_user

logger = logging.getLogger(__name__)

class CategoryListView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'token',
                openapi.IN_QUERY,
                description="User identifier token",
                type=openapi.TYPE_STRING,
                required=True
            ),
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
        user = get_user_from_query_param(request)
        if not user:
            return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter categories for the found user
        active = request.query_params.get('active')
        if active is not None and active.lower() == 'true':
            categories = Category.objects.filter(u_id=user, cat_active=True)
        else:
            categories = Category.objects.filter(u_id=user)
        
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'categoryId': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='ID of the category to modify'
                ),
                'token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User identifier token'
                ),
                'category': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='Partial object with category fields to update',
                    properties={
                        'cat_title': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Category title',
                            default=""
                        ),
                        'cat_description': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Category description',
                            default=""
                        ),
                        'cat_background': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Category background',
                            default=""
                        ),
                        'cat_foreground': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Category foreground',
                            default=""
                        ),
                        'cat_active': openapi.Schema(
                            type=openapi.TYPE_BOOLEAN,
                            description='Category active flag',
                            default=False
                        ),
                        'cat_examples': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Items(type=openapi.TYPE_STRING),
                            description='Category examples',
                            default=[]
                        ),
                        'cat_event_prefix': openapi.Schema(
                            type=openapi.TYPE_STRING,
                            description='Category event prefix',
                            default=""
                        ),
                    }
                ),
            },
            required=['categoryId', 'token', 'category']
        ),
        responses={
            200: openapi.Response('OK', CategorySerializer),
            400: openapi.Response('Bad Request'),
            404: openapi.Response('Not Found'),
        }
    )
    def put(self, request):
        category_id = request.data.get('categoryId')
        user_token = request.data.get('token')
        category_data = request.data.get('category')

        if not category_id or not user_token or category_data is None:
            return Response(
                {"detail": "categoryId, userToken and category (update data) are required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = fetch_user(user_token)
        if not user:
            return Response({"error": "Missing or incorrect token."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the category belongs to the user
        try:
            category = Category.objects.get(cat_id=category_id, u_id=user)
        except Category.DoesNotExist:
            return Response(
                {"detail": "Category not found for the specified user."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CategorySerializer(category, data=category_data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        