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

def process_initial_prompt(initial_prompt: str):
    # Environmental context
    current_datetime = datetime.now().isoformat()
    initial_prompt += f"\n[ENVIRONMENT]: The current datetime is {current_datetime}. The current timezone is {get_localzone()}."

    # Prompt context
    initial_prompt += "\n[PROMPT]: Do not ask any follow-up questions. Use the available tools and minimal information from the user to complete the task."
    return initial_prompt
