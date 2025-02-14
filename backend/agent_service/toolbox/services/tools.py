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
        "content": f"The current datetime is {datetime.now().isoformat()}. The current timezone is {get_localzone()}."
    }
