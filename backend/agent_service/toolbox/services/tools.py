from agent_service.toolbox.services.calendar import create_event, get_today_events, get_this_week_events
from openai import pydantic_function_tool
from agent_service.toolbox.models.calendar_event import CreateCalendarEvent, GetTodayEvents, GetThisWeekEvents
from datetime import datetime
from tzlocal import get_localzone

tools = [
    pydantic_function_tool(
        CreateCalendarEvent,
        description="Create a new calendar event based on the provided details. Use default color id."
    ),
    pydantic_function_tool(
        GetTodayEvents,
        description="Fetch all events scheduled for today."
    ),
    pydantic_function_tool(
        GetThisWeekEvents,
        description="Fetch all events scheduled for this week."
    )
]

tool_map = {
    "CreateCalendarEvent": create_event,
    "GetTodayEvents": get_today_events,
    "GetThisWeekEvents": get_this_week_events
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
        """
    }
