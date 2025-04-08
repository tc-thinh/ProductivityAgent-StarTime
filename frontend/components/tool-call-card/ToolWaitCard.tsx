import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ToolWaitCard({ message }: { message?: string }) {
    return (
        <Card className="border-0 shadow-none rounded-md">
            <CardHeader className="p-3">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium">{message}</h3>
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>
    );
}
