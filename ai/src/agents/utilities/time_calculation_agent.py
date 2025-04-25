import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from agents import Agent, Runner, function_tool
from src.utilities.langfuse import get_langfuse_client


def parse_datetime_string(dt_str: str) -> datetime.datetime:
    """Parses a datetime string, trying ISO format first."""
    try:
        return datetime.datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except ValueError:
        raise ValueError(f"Could not parse datetime string (expected ISO 8601 format): {dt_str}")

@function_tool
def add_time_delta(
        start_time: str, 
        weeks_delta: int, 
        days_delta: int, 
        hours_delta: int, 
        minutes_delta: int
    ) -> datetime.datetime:
    """
    Add a time delta to start_time.
    Expects start_time_str in ISO 8601 format (e.g., '2023-10-27T10:00:00+00:00').
    Returns the new time as an ISO 8601 formatted string.
    """

    try:
        start_time = parse_datetime_string(start_time)
    except ValueError as e:
        return f"Error parsing start_time_str: {e}"

    time_change = datetime.timedelta(
        weeks=weeks_delta, 
        days=days_delta, 
        hours=hours_delta, 
        minutes=minutes_delta
    )
    new_time = start_time + time_change
    return new_time

@function_tool
def convert_timezone(
        current_time: str, 
        current_timezone: str,
        target_timezone: str) -> datetime.datetime:
    """
    Convert current_time from current_timezone to target_timezone.
    Expects current_time_str in ISO 8601 format (e.g., '2023-10-27T10:00:00+00:00' or '2023-10-27T10:00:00').
    If the string is naive, current_timezone will be applied. If it has an offset, that will be used initially.
    Returns the converted time as an ISO 8601 formatted string.
    """

    try:
        current_time = parse_datetime_string(current_time)
    except ValueError as e:
        return f"Error parsing current_time_str: {e}"

    if not isinstance(current_time, datetime.datetime):
        raise TypeError("current_time must be a datetime.datetime object")

    try:
        source_tz = ZoneInfo(current_timezone)
        target_tz = ZoneInfo(target_timezone)
    except ZoneInfoNotFoundError as e:
        raise ZoneInfoNotFoundError(f"Invalid timezone specified: {e}") from e

    if current_time.tzinfo is None:
        aware_current_time = current_time.replace(tzinfo=source_tz)
    else:
        aware_current_time = current_time

    target_time = aware_current_time.astimezone(target_tz)

    return target_time

class TimeCalculationAgent:
    def __init__(self):
        self.name = "TimeCalculationAgent"
        self.description = "An agent that calculates the time operation & timezone conversion."
        self.langfuse_client = get_langfuse_client()

        self.model = self.langfuse_client.get_prompt(
            "TimeCalculationAgent_Model", 
            type="text"
        ).compile()
        self.instructions = self.langfuse_client.get_prompt(
            "TimeCalculationAgent_Instructions", 
            type="text"
        ).compile(
            currentTime=datetime.datetime.now(datetime.timezone.utc)
        )

        self.agent = Agent(
            name="Time Calculation Agent", 
            instructions=self.instructions,
            model=self.model,
            output_type=str,
            tools=[add_time_delta, convert_timezone]
        )

    async def process(self, prompt: str):
        """Process the prompt."""
        
        result = await Runner.run(self.agent, prompt)

        return result.final_output
    