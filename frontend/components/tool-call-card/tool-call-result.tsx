// components/ui/tool-call-result-card.tsx
import { Card, CardHeader} from "@/components/ui/card"
import { ToolCallResult } from "@/lib/types"

export function ToolCallResultCard({ result }: { result: ToolCallResult }) {
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

  const status = parsedContent.status || "waiting"
  const htmlLink = parsedContent.htmlLink

  return (
    <Card className="mt-2 shadow-sm border border-gray-200">
      <CardHeader className="text-sm text-gray-900">
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Status:</span>{" "}
            <span className="text-gray-900">{status}</span>
          </div>
          {htmlLink && (
            <div>
              <span className="font-medium text-gray-700">Event Link:</span>{" "}
              <a href={htmlLink} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                View Event
              </a>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}