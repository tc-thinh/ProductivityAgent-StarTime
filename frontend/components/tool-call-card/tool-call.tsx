// components/tool-call-card/tool-call.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ToolCall } from "@/lib/types"

export function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  // Parse the JSON arguments
  const functionArguments = JSON.parse(toolCall.function?.arguments || "{}")

  // Extract nested event and calendarId
  const event = functionArguments.event
  const calendarId = functionArguments.calendarId

  return (
    <Card className="mt-2 shadow-sm border border-gray-200">
      <CardHeader className="text-sm font-medium text-gray-700">
        Tool Call: {toolCall.function?.name}
      </CardHeader>
      <CardContent className="text-sm text-gray-900">
        <div className="space-y-2">
          {/* Display Calendar ID */}
          <div>
            <span className="font-medium text-gray-700">Calendar ID:</span>{" "}
            <span className="text-gray-900">{calendarId}</span>
          </div>

          {/* Display Event Details */}
          {event && (
            <>
              <div>
                <span className="font-medium text-gray-700">Summary:</span>{" "}
                <span className="text-gray-900">{event.summary}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Description:</span>{" "}
                <span className="text-gray-900">{event.description}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Start Time:</span>{" "}
                <span className="text-gray-900">
                  {new Date(event.start.dateTime).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">End Time:</span>{" "}
                <span className="text-gray-900">
                  {new Date(event.end.dateTime).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Time Zone:</span>{" "}
                <span className="text-gray-900">{event.start.timeZone}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Attendees:</span>{" "}
                <span className="text-gray-900">
                  {event.attendees
                    ?.map((attendee: any) => attendee.displayName || attendee.email)
                    .join(", ")}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}