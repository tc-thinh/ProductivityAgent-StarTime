import logging
import os
from dotenv import load_dotenv
from agents import Agent, Runner, function_tool
from typing import List, Literal

from src.agents.utilities.time_calculation_agent import TimeCalculationAgent
from src.utilities.google_auth import get_calendar_service
from src.utilities.langfuse import get_langfuse_client

load_dotenv()
CALENDAR = os.getenv('CALENDAR')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

logger = logging.getLogger(__name__)

class QueryCalendarEventAgent:
    def __init__(self, user_id: str, google_refresh_token: str, timezone: str = "UTC"):
        self.user_id = user_id
        self.name = "QueryCalendarEventAgent"
        self.description = "Retrieves calendar events based on criteria (date range, keyword)."

        self.google_refresh_token = google_refresh_token
        self.timezone = timezone

        @function_tool
        def query_events(
            calendarId: str,
            start_time: str,
            end_time: str,
            query_keyword: str,
        ) -> List[dict]:
            """
            Queries Google Calendar for events matching specified criteria via the API.

            Fetches events from a given calendar ID within an optional time range (`start_time`, `end_time`).
            Can filter results using a `query_keyword` across various event fields and restrict
            to certain `event_type`s (currently 'default' or 'birthday').

            Args:
                calendarId: Identifier of the calendar to query. Defaults to 'primary'.
                start_time: The inclusive start of the time range for the query, in RFC3339
                            format (e.g., '2025-04-26T00:00:00-07:00' or '2025-04-26T07:00:00Z').
                            If None, the API might use a default start time or query all past events
                            depending on other parameters (often requires `timeMax` or has limits).
                end_time: The exclusive end of the time range for the query, in RFC3339 format
                          (e.g., '2025-04-27T00:00:00-07:00' or '2025-04-27T07:00:00Z').
                          If None, the API might use a default end time or query indefinitely into
                          the future (often requires `timeMin` or has limits).
                query_keyword: A free-text query string used to search across event fields like
                               summary, description, location, organizer, and attendees.
                               If None or empty, no keyword filtering occurs. Keep concise.

            Returns:
                A list of dictionaries, where each dictionary represents a Google Calendar
                event resource matching the query criteria. Returns an empty list ([]) if no events match.
            """

            calendar_service = get_calendar_service(self.google_refresh_token)
            events_result = calendar_service.events().list(
                calendarId=calendarId,
                timeMin=start_time,
                timeMax=end_time,
                singleEvents=True,
                q=query_keyword,
                orderBy='startTime'
            ).execute()

            events = events_result.get('items', [])
            return events

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
            "QueryCalendarEventAgent_Model", type="text"
        ).compile()
        self.instructions = self.langfuse_client.get_prompt(
            "QueryCalendarEventAgent_Instructions", type="text"
        ).compile()

        self.agent = Agent(
            name="Query Calendar Event Agent",
            instructions=self.instructions,
            model=self.model,
            output_type=str,
            tools=[query_events, time_calculation_agent],
        )

    async def process(self, prompt: str) -> dict:
        """
        Process the prompt and query calendar events.
        """
        result = await Runner.run(self.agent, prompt)
        return result
