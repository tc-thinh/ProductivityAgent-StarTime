import logging
from database_service.models import User
import json

logger = logging.getLogger(__name__)

def fetch_token_from_body(request):
    return json.loads(request.body).get('token')

def fetch_token_from_query_params(request):
    return request.query_params.get('token')

def fetch_user(token: str):
    if not token:
        logger.warning("Token is missing.")
        return None
            
    # Attempt to retrieve the user with the given token
    try:
        user = User.objects.get(u_id=token)
        logger.info(f"User {token} found in request.")
    except User.DoesNotExist:
        logger.error(f"User with token {token} not found.")
        return None
    return user

def get_user_from_query_param(request) -> User:
    token = fetch_token_from_query_params(request)
    return fetch_user(token)

def get_user_from_body(request) -> User:
    token = fetch_token_from_body(request)
    return fetch_user(token)
