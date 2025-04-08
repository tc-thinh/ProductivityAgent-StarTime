import { useMemo } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function CreateEventCard({ result }: { result?: any }) {
  const eventData = useMemo(() => {
    const eventDetails = result?.content?.event_details || {};
    
    return {
      summary: eventDetails.summary,
      description: eventDetails.description,
      status: eventDetails.status,
      htmlLink: eventDetails.htmlLink,
      start: {
        dateTime: eventDetails.start?.dateTime,
        timeZone: eventDetails.start?.timeZone
      },
      end: {
        dateTime: eventDetails.end?.dateTime,
        timeZone: eventDetails.end?.timeZone
      }
    };
  }, [result]);

  if (!eventData.summary || !eventData.start.dateTime) return null;

  return (
    <Card className="border-0 shadow-none rounded-md">
      <CardHeader className="p-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{eventData.summary}</h3>
          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md">
            {eventData.status || "scheduled"}
          </span>
        </div>
        {eventData.description && (
          <p className="text-sm text-gray-600 mt-1">
            {eventData.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-3 pt-3 rounded-md">
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Start:</span>
            <span className="text-right">
              {new Date(eventData.start.dateTime).toLocaleString(undefined, {
                timeZone: eventData.start.timeZone,
                timeZoneName: 'short',
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">End:</span>
            <span className="text-right">
              {new Date(eventData.end.dateTime).toLocaleString(undefined, {
                timeZone: eventData.end.timeZone,
                timeZoneName: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {eventData.htmlLink && (
            <div className="flex justify-end pt-1">
              <a
                href={eventData.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                View in Google Calendar
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}