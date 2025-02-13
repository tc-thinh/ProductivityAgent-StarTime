from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
from dotenv import load_dotenv
from django.conf import settings
from ..models.calendar_event import CalendarEvent

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
BASE_DIR = settings.BASE_DIR
SCOPES = [CALENDAR]
TOKEN_PATH = os.path.join(BASE_DIR, "creds", "token.json")  # Store user tokens here
CREDENTIALS_PATH = os.path.join(BASE_DIR, "creds", "oauth_credentials.json")  # User OAuth credentials

def get_calendar_service():
    creds = None

    # Load saved credentials if they exist
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # If no valid credentials, perform OAuth flow
    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
        creds = flow.run_local_server(port = 8000)  # Opens OAuth login page in browser
        
        # Save new credentials for reuse
        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())

    # Build calendar service
    service = build('calendar', 'v3', credentials=creds)
    return service

def create_event(event: CalendarEvent, calendarId: str = 'primary'):
    service = get_calendar_service()
    event = service.events().insert(calendarId=calendarId, body=event).execute()
    return event
