from agent_service.toolbox.services.calendar import create_event, get_today_events, get_this_week_events, modify_event, delete_event
from openai import pydantic_function_tool
from agent_service.toolbox.models.calendar_event import CreateCalendarEvent, GetTodayEvents, GetThisWeekEvents, ModifyEvent, DeleteEvent
from datetime import datetime
from tzlocal import get_localzone
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
        GetThisWeekEvents,
        description="Fetch all events scheduled for this week."
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
    "GetThisWeekEvents": get_this_week_events,
    "ModifyEvent": modify_event,
    "DeleteEvent": delete_event
}

def get_environmental_context_prompt():
    prompt = AgentServiceConfig.langfuse_client.get_prompt("MainAgent_SystemContext", type="chat")

    return prompt.compile(
        today=str(datetime.now().isoformat()), 
        timezone=str(get_localzone())
    )
