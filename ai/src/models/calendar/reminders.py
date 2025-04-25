from pydantic import Field, BaseModel
from typing import List

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
        description="Indicates whether to use the calendar's default reminders."
    )
    overrides: List[ReminderOverride] = Field(
        ...,
        description="Custom reminder overrides if not using the default reminders."
    )
