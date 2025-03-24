import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from database_service.models import User

# Configure logging
logger = logging.getLogger(__name__)
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

            # Check if user exists
            try:
                user = User.objects.get(u_email=email)
                user.u_google_auth = google_auth
                user.save()
                logger.info(f"Updated Google auth for user: {email}")
            except User.DoesNotExist:
                user = User.objects.create(u_email=email, u_google_auth=google_auth)
                logger.info(f"Created new user: {email}")

            return Response({"token": str(user.u_id)}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"AuthView error: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_400_BAD_REQUEST)
