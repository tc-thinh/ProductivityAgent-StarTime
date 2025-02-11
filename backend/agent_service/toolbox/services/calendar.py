from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from django.conf import settings
from ..models.calendar_event import CalendarEvent

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
BASE_DIR = settings.BASE_DIR

def get_calendar_service():
    SCOPES = [CALENDAR]
    SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(BASE_DIR), "creds/credentails.json")

    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('calendar', 'v3', credentials=credentials)

    return service

def create_event(event: CalendarEvent):
    service = get_calendar_service()
    event = service.events().insert(calendarId='primary', body=event).execute()
    return event
