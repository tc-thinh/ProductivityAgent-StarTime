import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from database_service.models import User, Category

logger = logging.getLogger(__name__)

# Default categories data
DEFAULT_CATEGORIES = [
    {
        "cat_color_id": "1",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#a4bdfc",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "2",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#7ae7bf",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "3",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#dbadff",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "4",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#ff887c",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "5",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#fbd75b",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "6",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#ffb878",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "7",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#46d6db",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "8",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#e1e1e1",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "9",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#5484ed",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "10",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#51b749",
        "cat_foreground": "#1d1d1d"
    },
    {
        "cat_color_id": "11",
        "cat_title": "",
        "cat_description": "",
        "cat_background": "#dc2127",
        "cat_foreground": "#1d1d1d"
    },
]

class AuthView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'google_auth': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='Current Google auth object'
                ),
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='User email'
                )
            },
            required=['google_auth', 'email']
        ),
        responses={
            200: openapi.Response('OK'),
            400: openapi.Response('Bad Request'),
        }
    )
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            google_auth = data.get('google_auth')

            if not email:
                return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                # If the user exists, update the google_auth data.
                user = User.objects.get(u_email=email)
                user.u_google_auth = google_auth
                user.save()
                logger.info(f"Updated Google auth for user: {email}")
            except User.DoesNotExist:
                # Create a new user.
                user = User.objects.create(u_email=email, u_google_auth=google_auth)
                logger.info(f"Created new user: {email}")
                
                # For each new user, create the default categories.
                for cat_data in DEFAULT_CATEGORIES:
                    Category.objects.create(u_id=user, **cat_data)
                logger.info(f"Added default categories for user: {email}")

            return Response({"token": str(user.u_id)}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"AuthView error: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)
