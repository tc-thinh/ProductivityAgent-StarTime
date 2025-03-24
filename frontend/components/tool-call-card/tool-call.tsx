// components/tool-call-card/tool-call.tsx
import { ToolCall } from "@/lib/types"
import { useState } from "react"
import { ToolCallResultCard } from "@/components/tool-call-card/tool-call-result"

export function ToolCallCard({ toolCall, result }: { toolCall: ToolCall; result?: any }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const functionArguments = JSON.parse(toolCall.function?.arguments || "{}")
  const event = functionArguments.event

  const toolCallDisplayName = toolCall.function?.name === "create_calendar_event" 
    ? "Create Calendar Event" 
    : toolCall.function?.name

  return (
    <div className="mt-2 p-4">
      <div className="text-sm text-gray-900">
        <div className="space-y-2">
          {event && (
            <>
              <div>
                <span className="font-medium text-gray-700">Title:</span>{" "}
                <span className="text-gray-900">{event.summary}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Description:</span>{" "}
                <span className="text-gray-900">{event.description}</span>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-500 hover:underline"
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </button>
              {isExpanded && (
                <div className="mt-2 space-y-2">
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
                    <span className="font-medium text-gray-700">Attendees:</span>{" "}
                    <span className="text-gray-900">
                      {event.attendees
                        ?.map((attendee: any) => attendee.displayName || attendee.email)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Display the tool call result if available */}
      {result && (
        <div className="mt-2">
          <ToolCallResultCard result={result} />
        </div>
      )}
    </div>
  )
}