from agent_service.apps import AgentServiceConfig
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import logging
from app_lib.utils.users import fetch_user
import os
from dotenv import load_dotenv
from agents import Agent, Runner, function_tool
from agent_service.toolbox.models.calendar_event import Reminders
from typing import List
from agent_service.agents.calendar.category_management_agent import CategoryManagementAgent
from agent_service.agents.utilities.time_calculation_agent import TimeCalculationAgent

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

logger = logging.getLogger(__name__)

class CreateCalendarEventAgent:
    def __init__(self, user_id: str, timezone: str = "UTC"):
        self.user_id = user_id
        self.name = "CreateCalendarEventAgent"
        self.description = "An agent that creates calendar events."

        self.calendar_serivce = self._get_calendar_service(user_id)
        self.timezone = timezone

        @function_tool
        def create_event(
            self, 
            all_day: bool,
            start_time: str,
            end_time: str,
            summary: str,
            description: str = None,
            location: str = None,
            attendees: List[str] = None,
            reminders: Reminders = None,
            recurrence: List[str] = None,
            calendarId: str = 'primary',
        ) -> dict:

            """
            Create a calendar event.
            Inputs:
            - all_day: Boolean indicating if the event is all-day (True) or timed (False).
            - start_time/end_time: Event date and time (e.g., '2025-02-10T10:00:00-05:00' - use for timed events) OR event date (e.g., '2025-02-10' - use for all-day events) in RFC3339 format.
            - summary: Event title.
            - description: Event description.
            - location: Event location.
            - attendees: List of email addresses of attendees.
            - reminders: Reminder Object (e.g., Reminders(useDefault=False, overrides=[ReminderOverride(method='email/popup', minutes=10)]))
            - recurrence: Recurrence rules for the event in RFC 5545 format (e.g., 'RRULE:FREQ=WEEKLY;COUNT=10').
            - calendarId: Calendar ID (default is 'primary').
            """
            category_agent = CategoryManagementAgent(self.user_id)
            category = category_agent.process(summary, description)
            summary = category.get('cat_event_prefix', '') + summary
            color_id = category.get('cat_color_id', '0')
            start = { 'dateTime': start_time, 'timeZone': self.timezone } if not all_day else { 'date': start_time, 'timeZone': self.timezone }
            end = { 'dateTime': end_time, 'timeZone': self.timezone } if not all_day else { 'date': end_time, 'timeZone': self.timezone }

            event = {
                'start': start,
                'end': end,
                'summary': summary,
                'description': description,
                'location': location,
                'attendees': [{'email': attendee} for attendee in attendees] if attendees else [],
                'reminders': {
                    'useDefault': reminders.useDefault,
                    'overrides': [{'method': override.method, 'minutes': override.minutes} for override in reminders.overrides] if reminders.overrides else []
                },
                'colorId': color_id,
                'recurrence': recurrence if recurrence else []
            }

            calendar_service = self._get_calendar_service(self.user_id)

            event = calendar_service.events().insert(calendarId=calendarId, body=event).execute()
            return event
        
        @function_tool
        def time_calculation_agent(
            prompt: str
        ) -> str:
            """
            Calculate time based on the prompt (e.g. When is this Friday? When is the start and the end of this week?).
            """
            
            time_agent = TimeCalculationAgent()
            return time_agent.process(prompt)
        
        self.model = AgentServiceConfig.langfuse_client.get_prompt(
            "CreateCalendarEventAgent_Model", type="text"
        )
        self.instructions = AgentServiceConfig.langfuse_client.get_prompt(
            "CreateCalendarEventAgent_Instructions", type="text"
        )

        self.agent = Agent(
            name="Create Calendar Event Agent",
            instructions=self.instructions,
            model=self.model,
            output_type=dict,
            functions=[create_event, time_calculation_agent],
        )

    def _get_calendar_service(token: str):
        user = fetch_user(token)
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
                user.save()  # Save the updated user
                logger.info("Token refreshed successfully.")
            except Exception as e:
                logger.error(f"Failed to refresh token: {e}", exc_info=True)

        # Build calendar service
        service = build('calendar', 'v3', credentials=creds)
        return service

    def process(self, prompt: str) -> dict:
        """
        Process the prompt and create a calendar event.
        """
        runner = Runner(self.agent, prompt)
        result = runner.run_sync(prompt)
        return result.final_output
