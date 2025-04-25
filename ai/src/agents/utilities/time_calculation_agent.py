import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from agents import Agent, Runner, function_tool
from src.utilities.langfuse import get_langfuse_client

def parse_datetime_string(dt_str: str) -> datetime.datetime:
    """Parses a datetime string, trying ISO format first."""
    try:
        # Handle potential 'Z' for UTC and ensure timezone info is present
        dt_str_adjusted = dt_str.replace('Z', '+00:00')
        return datetime.datetime.fromisoformat(dt_str_adjusted)
    except ValueError:
        # Try parsing date-only strings
        try:
            date_obj = datetime.date.fromisoformat(dt_str)
            # Return as datetime at midnight UTC for consistency,
            # though this function primarily cares about the date part.
            return datetime.datetime.combine(date_obj, datetime.time.min, tzinfo=datetime.timezone.utc)
        except ValueError:
            raise ValueError(f"Could not parse datetime string (expected ISO 8601 format): {dt_str}")
    except Exception as e:
         raise ValueError(f"Unexpected error parsing datetime string '{dt_str}': {e}")


@function_tool
def add_time_delta(
        start_time_str: str, 
        weeks_delta: int,
        days_delta: int,
        hours_delta: int,
        minutes_delta: int
    ) -> str: 
    """Adds a specified duration to a given start time.

    Parses the start time string, adds the specified time delta (weeks, days,
    hours, minutes), and returns the resulting time as an ISO 8601 formatted string.

    Args:
        start_time_str: The starting date/time in ISO 8601 format
                        (e.g., '2023-10-27T10:00:00+00:00' or '2023-10-27').
        weeks_delta: The number of weeks to add (can be negative).
        days_delta: The number of days to add (can be negative).
        hours_delta: The number of hours to add (can be negative).
        minutes_delta: The number of minutes to add (can be negative).

    Returns:
        The new date/time calculated by adding the delta, formatted as an
        ISO 8601 string.

    Raises:
        ValueError: If start_time_str cannot be parsed into a valid ISO 8601
                    datetime or date format.
    """
    try:
        start_time = parse_datetime_string(start_time_str)
    except ValueError as e:
        # It's better practice for tools to raise exceptions for agent handling
        # rather than returning error strings directly in the output slot.
        raise ValueError(f"Error parsing start_time_str: {e}") from e

    time_change = datetime.timedelta(
        weeks=weeks_delta,
        days=days_delta,
        hours=hours_delta,
        minutes=minutes_delta
    )
    new_time = start_time + time_change
    return new_time.isoformat()

@function_tool
def convert_timezone(
        time_str: str, 
        target_timezone: str
    ) -> str:
    """Converts a timezone-aware datetime string to a target timezone.

    Parses an ISO 8601 formatted datetime string (which must include timezone
    information) and converts it to the specified target IANA timezone.

    Args:
        time_str: The datetime string to convert, in ISO 8601 format
                  with timezone information (e.g., '2023-10-27T10:00:00-07:00'
                  or '2023-10-27T17:00:00Z'). Naive datetimes (without timezone)
                  are not supported.
        target_timezone: The target IANA timezone name (e.g., 'America/New_York',
                         'Europe/London', 'UTC').

    Returns:
        The converted datetime, formatted as an ISO 8601 string, including
        the offset for the target timezone.

    Raises:
        ValueError: If time_str cannot be parsed, or if it represents a naive
                    datetime (lacks timezone information).
        ZoneInfoNotFoundError: If the target_timezone is not a valid IANA
                               timezone identifier.
    """
    try:
        time_obj = parse_datetime_string(time_str)
    except ValueError as e:
        raise ValueError(f"Error parsing time_str: {e}") from e

    try:
        target_tz = ZoneInfo(target_timezone)
    except ZoneInfoNotFoundError as e:
        raise ZoneInfoNotFoundError(f"Invalid target_timezone specified: {e}") from e

    if time_obj.tzinfo is None:
        raise ValueError("time_str cannot be naive")
    else:
        aware_time = time_obj

    target_time = aware_time.astimezone(target_tz)
    return target_time.isoformat()


@function_tool
def get_weekday_date_in_week(
    reference_date_str: str,
    target_weekday: int
) -> str: 
    """Finds the date of a specific weekday within the same week as a reference date.

    Calculates the date for the target weekday (Monday=0, ..., Sunday=6)
    that falls within the same calendar week (Monday to Sunday) as the
    provided reference date. The time component of the reference date is ignored.

    Args:
        reference_date_str: A reference date string in ISO 8601 format
                            (e.g., '2023-10-27T10:00:00+00:00' or '2023-10-27').
                            Only the date part is used.
        target_weekday: The integer representing the desired day of the week,
                        where Monday is 0 and Sunday is 6.

    Returns:
        The calculated date of the target weekday within the reference week,
        formatted as 'YYYY-MM-DD'.

    Raises:
        ValueError: If target_weekday is not between 0 and 6 (inclusive), or
                    if reference_date_str cannot be parsed into a valid ISO 8601
                    datetime or date format.
    """
    if not 0 <= target_weekday <= 6:
        raise ValueError("target_weekday must be an integer between 0 (Monday) and 6 (Sunday).")

    try:
        # Parse the reference string and just take the date part
        reference_dt = parse_datetime_string(reference_date_str)
        reference_date = reference_dt.date()
    except ValueError as e:
        raise ValueError(f"Error parsing reference_date_str: {e}") from e

    # Get the weekday of the reference date (Monday=0, Sunday=6)
    ref_weekday = reference_date.weekday()

    # Calculate days difference to get to the target weekday *in the same week*
    days_difference = target_weekday - ref_weekday

    # Calculate the actual date
    target_date = reference_date + datetime.timedelta(days=days_difference)

    return target_date.isoformat()

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
            tools=[add_time_delta, convert_timezone, get_weekday_date_in_week]
        )

    async def process(self, prompt: str):
        """Process the prompt."""
        
        result = await Runner.run(self.agent, prompt)

        return result.final_output
    