from agent_service.toolbox.services.calendar import create_event, get_today_events, get_this_week_events, modify_event, delete_event, get_tomorrow_events, get_next_week_events
from openai import pydantic_function_tool
from agent_service.toolbox.models.calendar_event import CreateCalendarEvent, GetTodayEvents, GetThisWeekEvents, ModifyEvent, DeleteEvent, GetTomorrowEvents, GetNextWeekEvents
from datetime import datetime
from pytz import timezone
from agent_service.apps import AgentServiceConfig

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
        GetTomorrowEvents,
        description="Fetch all events scheduled for tomorrow."
    ),
    pydantic_function_tool(
        GetThisWeekEvents,
        description="Fetch all events scheduled for this week."
    ),
    pydantic_function_tool(
        GetNextWeekEvents,
        description="Fetch all events scheduled for next week."
    ),
    pydantic_function_tool(
        ModifyEvent,
        description="Modify an existing calendar event. Provide the event ID and the new details."
    ),
    pydantic_function_tool(
        DeleteEvent,
        description="Delete an existing calendar event. Provide the event ID."
    )
]

tool_map = {
    "CreateCalendarEvent": create_event,
    "GetTodayEvents": get_today_events,
    "GetTomorrowEvents": get_tomorrow_events,
    "GetThisWeekEvents": get_this_week_events,
    "GetNextWeekEvents": get_next_week_events,
    "ModifyEvent": modify_event,
    "DeleteEvent": delete_event
}

def get_environmental_context_prompt(iana_timezone: str) -> str:
    prompt = AgentServiceConfig.langfuse_client.get_prompt("MainAgent_SystemContext", type="chat")

    local_time = datetime.now(timezone(iana_timezone)).isoformat()

    return prompt.compile(
        today=local_time, 
        timezone=iana_timezone,
    )
