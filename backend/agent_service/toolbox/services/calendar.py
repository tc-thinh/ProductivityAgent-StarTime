from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import os
from dotenv import load_dotenv
from django.conf import settings
from agent_service.toolbox.models.calendar_event import CalendarEvent
from database_service.models.KVStore import SqliteKVStore
import logging

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
BASE_DIR = settings.BASE_DIR

logger = logging.getLogger(__name__)

async def get_calendar_service():
    kv_store = SqliteKVStore(namespace="auth")
    auth_data = await kv_store.get('GoogleAuthToken')
    auth_data["client_id"] = GOOGLE_CLIENT_ID
    auth_data["client_secret"] = GOOGLE_CLIENT_SECRET
    creds = Credentials.from_authorized_user_info(auth_data)

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            await kv_store.set('GoogleAuthToken', {
                'token': creds.token,
                'refresh_token': creds.refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': creds.scopes
            })
            logger.info("Token refreshed successfully.")
        except Exception as e:
            logger.error(f"Failed to refresh token: {e}", exc_info=True)

    # Build calendar service
    service = build('calendar', 'v3', credentials=creds)
    return service

async def create_event(event: CalendarEvent, calendarId: str = 'primary'):
    service = await get_calendar_service()
    event = service.events().insert(calendarId=calendarId, body=event).execute()
    return event
