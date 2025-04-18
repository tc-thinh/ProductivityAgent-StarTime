from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import os
from dotenv import load_dotenv
from django.conf import settings
from agent_service.toolbox.models.calendar_event import CalendarEvent
from app_lib.utils.users import fetch_user
import logging
from datetime import datetime, timedelta, timezone
from agent_service.toolbox.services.categories import get_category_by_event
from asgiref.sync import sync_to_async

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
BASE_DIR = settings.BASE_DIR

logger = logging.getLogger(__name__)

async def get_calendar_service(token: str):
    user = await sync_to_async(fetch_user)(token)
    auth_data = user.u_google_auth
    auth_data["client_id"] = GOOGLE_CLIENT_ID
    auth_data["client_secret"] = GOOGLE_CLIENT_SECRET
    creds = Credentials.from_authorized_user_info(auth_data)

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Update the u_google_auth attribute
            user.u_google_auth = {
                'token': creds.token,
                'refresh_token': creds.refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': creds.scopes
            }
            await sync_to_async(user.save)()  # Save the updated user
            logger.info("Token refreshed successfully.")
        except Exception as e:
            logger.error(f"Failed to refresh token: {e}", exc_info=True)

    # Build calendar service
    service = build('calendar', 'v3', credentials=creds)
    return service

def simplify_event(event):
    """Extract only essential information from event"""
    simplified = {
        'summary': event.get('summary', 'No Title'),
        'start': event.get('start', {}).get('dateTime', event.get('start', {}).get('date', 'Unknown')),
        'end': event.get('end', {}).get('dateTime', event.get('end', {}).get('date', 'Unknown'))
    }
    return simplified

async def create_event(event: CalendarEvent, token: str, calendarId: str = 'primary'):
    color_category = get_category_by_event(event.get('summary', ''), event.get('description', ''), token)
    logger.info(f"Color category: {color_category}")

    event['colorId'] = color_category['cat_color_id']
    event['summary'] = f"{color_category['cat_event_prefix']} {event['summary']}"

    service = await get_calendar_service(token)
    event = service.events().insert(calendarId=calendarId, body=event).execute()
    return event

async def get_today_events(token: str, calendarId: str = 'primary'):
    service = await get_calendar_service(token)
    
    # Get current date in the correct timezone
    now = datetime.now()
    today = now.date()
    
    # Calculate today's date boundaries
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Format to RFC3339 timestamp
    start_time_str = start_of_day.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    end_time_str = end_of_day.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    # Call the Calendar API
    events_result = service.events().list(
        calendarId=calendarId,
        timeMin=start_time_str,
        timeMax=end_time_str,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    
    # Simplify events to only include essential information
    simplified_events = [simplify_event(event) for event in events]
    
    return simplified_events
    
async def get_this_week_events(token: str, calendarId: str = 'primary'):
    service = await get_calendar_service(token)
    
    # Get current date
    now = datetime.now()
    today = now.date()
    
    # Calculate this week's date boundaries (Monday to Sunday)
    start_of_week = today - timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=6)  # Sunday
    
    start_datetime = datetime.combine(start_of_week, datetime.min.time())
    end_datetime = datetime.combine(end_of_week, datetime.max.time())
    
    # Format to RFC3339 timestamp
    start_time_str = start_datetime.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    end_time_str = end_datetime.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
    
    # Call the Calendar API
    events_result = service.events().list(
        calendarId=calendarId,
        timeMin=start_time_str,
        timeMax=end_time_str,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    
    # Simplify events to only include essential information
    simplified_events = [simplify_event(event) for event in events]
    
    return simplified_events
