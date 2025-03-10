// components/ui/tool-call-result-card.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { ToolCallResult } from "@/lib/types"

export function ToolCallResultCard({ result }: { result: ToolCallResult }) {
    // Parse the content if it's a JSON string
    const parsedContent = typeof result.content === "string"
    ? JSON.parse(
        result.content
            .replace(/'/g, '"')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false')
            .replace(/,(\s*[}\]])/g, '$1')
            .replace(/\\"/g, '"')         
        )
    : result.content;


  return (
    <Card className="mt-2 shadow-sm border border-gray-200">
      <CardHeader className="text-sm font-medium text-gray-700">
        Tool Call Result: {result.tool_call_id}
      </CardHeader>
      <CardContent className="text-sm text-gray-900">
        <div className="space-y-2">
          {/* Display status if available */}
          {result.status && (
            <div>
              <span className="font-medium text-gray-700">Status:</span>{" "}
              <span className="text-gray-900">{result.status}</span>
            </div>
          )}

          {/* Display parsed content */}
          {Object.entries(parsedContent).map(([key, value]) => (
            <div key={key}>
              <span className="font-medium text-gray-700">{key}:</span>{" "}
              <span className="text-gray-900">
                {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}