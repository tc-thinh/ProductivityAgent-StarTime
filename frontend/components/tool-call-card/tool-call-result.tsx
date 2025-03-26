// components/ui/tool-call-result-card.tsx
import { Card, CardHeader } from "@/components/ui/card"
import { ToolCallResult } from "@/lib/types"
import { useMemo } from "react"

export function ToolCallResultCard({ result }: { result: ToolCallResult }) {
  const { parsedContent, parseError } = useMemo(() => {
    try {
      if (typeof result.content === 'string') {
        // First try parsing as-is (might already be valid JSON)
        try {
          return { parsedContent: JSON.parse(result.content), parseError: null }
        } catch (e) {
          // If that fails, try cleaning up the string
          try {
            const cleanedContent = result.content
              .replace(/'/g, '"')          // Replace single quotes with double quotes
              .replace(/True/g, 'true')    // Replace Python True with JSON true
              .replace(/False/g, 'false')  // Replace Python False with JSON false
              .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
              .replace(/None/g, 'null')    // Replace Python None with JSON null
              .replace(/\\"/g, '"')        // Unescape quotes

            return { parsedContent: JSON.parse(cleanedContent), parseError: null }
          } catch (cleanError) {
            console.error('Failed to parse tool call result:', cleanError)
            return { parsedContent: null, parseError: 'Failed to parse result' }
          }
        }
      }
      return { parsedContent: result.content, parseError: null }
    } catch (error) {
      console.error('Unexpected error processing tool call result:', error)
      return { parsedContent: null, parseError: 'Unexpected error' }
    }
  }, [result.content])

  const status = parsedContent?.status || "waiting"
  const htmlLink = parsedContent?.htmlLink

  return (
    <Card className="mt-2 shadow-sm border border-gray-200">
      <CardHeader className="text-sm text-gray-900">
        <div className="space-y-2">
          {parseError ? (
            <div className="text-red-500">{parseError}</div>
          ) : (
            <>
              <div>
                <span className="font-medium text-gray-700">Status:</span>{" "}
                <span className="text-gray-900">{status}</span>
              </div>
              {htmlLink && (
                <div>
                  <span className="font-medium text-gray-700">Event Link:</span>{" "}
                  <a 
                    href={htmlLink} 
                    className="text-blue-500 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Event
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </CardHeader>
    </Card>
  )
}