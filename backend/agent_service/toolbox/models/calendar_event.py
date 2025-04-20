from typing import List, Union, Dict, Any
from pydantic import BaseModel, Field

# Model for date/time information.
# When creating an event, you must supply either a "dateTime" (for timed events)
class EventDateTime(BaseModel):
    dateTime: str = Field(
        ...,
        description="Event date and time in RFC3339 format (e.g., '2025-02-10T10:00:00-05:00'). Use for timed events."
    )
    timeZone: str = Field(
        ...,
        description="Time zone of the event in IANA format (e.g., 'America/New_York')."
    )

# Full date event model.
class FullDayEventDate(BaseModel):
    date: str = Field(
        ...,
        description="Event date in RFC3339 format (e.g., '2025-02-10'). Use for all-day events."
    )
    timeZone: str = Field(
        ...,
        description="Time zone of the event in IANA format (e.g., 'America/New_York')."
    )

# Model for an attendee.
class Attendee(BaseModel):
    email: str = Field(
        ...,
        description="Email address of the attendee."
    )
    displayName: str = Field(
        ...,
        description="Display name of the attendee."
    )

# Model for reminder override entries.
class ReminderOverride(BaseModel):
    method: str = Field(
        ...,
        description="Reminder method (e.g., 'email' or 'popup')."
    )
    minutes: int = Field(
        ...,
        description="Number of minutes before the event when the reminder should trigger."
    )

# Model for event reminders.
class Reminders(BaseModel):
    useDefault: bool = Field(
        ...,
        description="Indicates whether to use the calendar’s default reminders."
    )
    overrides: List[ReminderOverride] = Field(
        ...,
        description="Custom reminder overrides if not using the default reminders."
    )

# Main Calendar Event model.
class CalendarEvent(BaseModel):
    start: Union[EventDateTime, FullDayEventDate] = Field(
        ...,
        description="The event's start time. Use 'dateTime' for timed events or 'date' for all-day events."
    )
    end: Union[EventDateTime, FullDayEventDate] = Field(
        ...,
        description="The event's end time. Use 'dateTime' for timed events or 'date' for all-day events."
    )
    summary: str = Field(
        ...,
        description="Title or summary of the event."
    )
    description: str = Field(
        ...,
        description="Detailed description of the event."
    )
    location: str = Field(
        ...,
        description="Location where the event is held."
    )
    attendees: List[Attendee] = Field(
        ...,
        description="List of attendees invited to the event. Do not invite anyone if the user does not exclusively mention any emails."
    )
    reminders: Reminders = Field(
        ...,
        description="Reminder settings for the event."
    )
    colorId: str = Field(
        ...,
        description="Color identifier for the event. Default is '0'."
    )
    recurrence: List[str] = Field(
        ...,
        description="Recurrence rules for the event in RFC 5545 format (e.g., 'RRULE:FREQ=WEEKLY;COUNT=10')."
    )

# Model to wrap the event along with the calendar identifier.
class CreateCalendarEvent(BaseModel):
    event: CalendarEvent = Field(
        ...,
        description="The calendar event details to be created."
    )
    calendarId: str = Field(
        ...,
        description="Identifier of the calendar where the event should be added (e.g., 'primary')."
    )

class GetTodayEvents(BaseModel):
    calendarId: str = Field(
        ...,
        description="Identifier of the calendar to fetch events from (e.g., 'primary')."
    )

class GetThisWeekEvents(BaseModel):
    calendarId: str = Field(
        ...,
        description="Identifier of the calendar to fetch events from (e.g., 'primary')."
    )

class ModifyEvent(BaseModel):
    eventId: str = Field(
        ...,
        description="Identifier of the event to be modified."
    )
    modifiedEvent: CalendarEvent = Field(
        ...,
        description="The calendar event details that replace the old event - like a PUT request."
    )
