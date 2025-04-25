import logging
import os
from dotenv import load_dotenv
from agents import Agent, Runner, function_tool
from typing import List
from src.agents.calendar.category_management_agent import CategoryManagementAgent
from src.agents.utilities.time_calculation_agent import TimeCalculationAgent
from src.utilities.google_auth import get_calendar_service
from src.utilities.langfuse import get_langfuse_client
from src.models.calendar.reminders import Reminders

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

logger = logging.getLogger(__name__)

class CreateCalendarEventAgent:
    def __init__(self, user_id: str, google_refresh_token: str, timezone: str = "UTC"):
        self.user_id = user_id
        self.name = "CreateCalendarEventAgent"
        self.description = "An agent that creates calendar events."
        self.google_refresh_token = google_refresh_token

        self.timezone = timezone

        @function_tool
        async def create_event(
            all_day: bool,
            start_time: str,
            end_time: str,
            summary: str,
            description: str,
            location: str,
            attendees: List[str],
            reminders: Reminders,
            recurrence: List[str],
            calendarId: str,
        ) -> dict:
            """
            Creates a single event in the user's Google Calendar via the API.

            Args:
                all_day: Boolean indicating if the event lasts for the entire day (True)
                         or occurs at specific times (False).
                start_time: The starting date (e.g., '2025-04-26' for all-day events) or
                            datetime in RFC3339 format (e.g., '2025-04-26T10:00:00-07:00'
                            for timed events). The timezone specified within the string
                            or the agent's default timezone will be used by the API.
                end_time: The ending date (e.g., '2025-04-27' for a single all-day event ending
                          before this day) or datetime in RFC3339 format (e.g.,
                          '2025-04-26T11:00:00-07:00' for timed events). For all-day events,
                          the end date is exclusive.
                summary: The main title or name of the event. This may be prefixed by
                         category information determined by the CategoryManagementAgent.
                description: A more detailed description or notes for the event. Can be empty.
                location: The physical address, meeting room, or virtual meeting link
                          associated with the event. Can be empty.
                attendees: A list of email addresses for individuals to be invited.
                           An empty list signifies no attendees.
                reminders: A Reminders object specifying notification preferences.
                           Must conform to the Reminders model structure, e.g.,
                           `Reminders(useDefault=False, overrides=[ReminderOverride(method='popup', minutes=30)])`.
                           Ensure the Reminders and ReminderOverride models are defined correctly.
                recurrence: A list of strings defining the recurrence rules according to the
                            RFC5545 (iCalendar) standard. Example: `['RRULE:FREQ=WEEKLY;COUNT=10']`.
                            An empty list indicates a non-recurring event.
                calendarId: The identifier of the target calendar. Defaults to 'primary',
                            representing the main calendar of the authenticated user.

            Returns:
                A dictionary containing the Google Calendar Event resource representation
                of the newly created event, as returned by the Google Calendar API.
                Includes fields like event ID, status, htmlLink, etc.

            Raises:
                googleapiclient.errors.HttpError: If the Google Calendar API request fails
                                                  (e.g., due to authentication issues, invalid data format,
                                                  permissions error).
                Exception: Can potentially raise exceptions from `get_calendar_service` if
                           authentication fails severely, or from `CategoryManagementAgent.process`.
            """
            category_agent = CategoryManagementAgent(self.user_id)
            category = await category_agent.process(summary, description)
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

            calendar_service = get_calendar_service(self.google_refresh_token)

            event = calendar_service.events().insert(calendarId=calendarId, body=event).execute()
            return event
        
        @function_tool
        async def time_calculation_agent(
            prompt: str
        ) -> str:
            """
            Resolves natural language time expressions into concrete date/time information.

            This tool delegates the task of interpreting time-related queries (like
            "next Tuesday at 3pm", "end of this month", "in two weeks", "tomorrow morning") 
            to the specialized `TimeCalculationAgent`. 

            Args:
                prompt: The natural language query regarding time, dates, or durations.
                        Examples: "What date is this Friday?", 
                        "Calculate the end time for a 90 minute meeting starting now",
                        "next Monday at 10am", "end of week".

            Returns:
                A string containing the resolved date, time, or time range information,
                formatted appropriately for direct use in the `create_event` tool's 
                `start_time` and `end_time` arguments or for further agent reasoning. 
                The exact format (e.g., RFC3339, YYYY-MM-DD, or descriptive text) depends 
                on the `TimeCalculationAgent`'s output for the given prompt.

            Raises:
                Exception: Can potentially raise exceptions from `TimeCalculationAgent.process` 
                           if the time expression cannot be parsed or calculated.
            """
            
            time_agent = TimeCalculationAgent()
            return await time_agent.process(prompt)
        
        self.langfuse_client = get_langfuse_client()
        self.model = self.langfuse_client.get_prompt(
            "CreateCalendarEventAgent_Model", type="text"
        ).compile()
        self.instructions = self.langfuse_client.get_prompt(
            "CreateCalendarEventAgent_Instructions", type="text"
        ).compile()

        self.agent = Agent(
            name="Create Calendar Event Agent",
            instructions=self.instructions,
            model=self.model,
            output_type=str,
            tools=[create_event, time_calculation_agent],
        )

    async def process(self, prompt: str) -> dict:
        """
        Process the prompt and create a calendar event.
        """
        result = await Runner.run(self.agent, prompt)
        return result.final_output
