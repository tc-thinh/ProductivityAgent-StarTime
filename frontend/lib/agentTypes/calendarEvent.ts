// Model for date/time information.
// When creating an event, you must supply either a "dateTime" (for timed events)
export interface EventDateTime {
    /** Event date and time in RFC3339 format (e.g., '2025-02-10T10:00:00-05:00'). Use for timed events. */
    dateTime: string;
    /** Time zone of the event in IANA format (e.g., 'America/New_York'). */
    timeZone: string;
}

// Full date event model.
export interface FullDayEventDate {
    /** Event date in RFC3339 format (e.g., '2025-02-10'). Use for all-day events. */
    date: string;
    /** Time zone of the event in IANA format (e.g., 'America/New_York'). */
    timeZone: string;
}

// Model for an attendee.
export interface Attendee {
    /** Email address of the attendee. */
    email: string;
    /** Display name of the attendee. */
    displayName: string;
}

// Model for reminder override entries.
export interface ReminderOverride {
    /** Reminder method (e.g., 'email' or 'popup'). */
    method: string;
    /** Number of minutes before the event when the reminder should trigger. */
    minutes: number;
}

// Model for event reminders.
export interface Reminders {
    /** Indicates whether to use the calendar’s default reminders. */
    useDefault: boolean;
    /** Custom reminder overrides if not using the default reminders. */
    overrides: ReminderOverride[];
}

// Main Calendar Event model.
export interface CalendarEvent {
    /**
     * The event's start time. Use 'dateTime' for timed events or 'date' for all-day events.
     * This can be either EventDateTime or FullDayEventDate.
     */
    start: EventDateTime | FullDayEventDate;
    /**
     * The event's end time. Use 'dateTime' for timed events or 'date' for all-day events.
     * This can be either EventDateTime or FullDayEventDate.
     */
    end: EventDateTime | FullDayEventDate;
    /** Title or summary of the event. */
    summary: string;
    /** Detailed description of the event. */
    description: string;
    /** Location where the event is held. */
    location: string;
    /**
     * List of attendees invited to the event. Do not invite anyone if the user does not exclusively mention any emails.
     */
    attendees: Attendee[];
    /** Reminder settings for the event. */
    reminders: Reminders;
    /** Color identifier for the event. Default is '0'. */
    colorId: string;
    /**
     * Recurrence rules for the event in RFC 5545 format (e.g., 'RRULE:FREQ=WEEKLY;COUNT=10').
     */
    recurrence: string[];
}
