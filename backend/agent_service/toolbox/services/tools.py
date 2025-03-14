from .calendar import create_event
from openai import pydantic_function_tool
from ..models.calendar_event import CreateCalendarEvent
from datetime import datetime
from tzlocal import get_localzone

tools = [
    pydantic_function_tool(CreateCalendarEvent)
]

tool_map = {
    "CreateCalendarEvent": create_event
}

def get_environmental_context_prompt():
    return {
        "role": "system",
        "content": f"""
            As an event assistant bot, use your predefined tools to create events based on user input. 
            The current datetime is {datetime.now().isoformat()}. The current timezone is {get_localzone()}.

            # Contextual Guidelines:
            - Ensure the time zone context is accounted for when scheduling events.
            - If the user provides incomplete information, create the event with the available details and leave any missing or uncertain information blank.
            - When parsing event details, account for variations in user input (e.g., "tomorrow" = next day at the same time zone).
            - When time is not specified, default to a reasonable time based on the event type:
                - Meetings → Default to 9:00 AM
                - Deadlines → Default to 11:59 PM
                - Reminders → Default to 8:00 AM
        """
    }
