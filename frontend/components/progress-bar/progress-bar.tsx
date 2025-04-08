"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"

export function ProgressPage({ 
    initPercentage = 13, 
    timeDone = 100 
}: { 
    initPercentage?: number, 
    timeDone?: number 
}) {
    const [progress, setProgress] = React.useState(initPercentage)

    React.useEffect(() => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime
            const newProgress = Math.min(
                initPercentage + (100 - initPercentage) * (elapsed / timeDone),
                100
            )
            setProgress(newProgress)
            if (newProgress >= 100) {
                clearInterval(interval)
            }
        }, 16)

        return () => clearInterval(interval)
    }, [initPercentage, timeDone])

    const getMessage = (progress: number) => {
        if (progress >= 100) return "Complete! ✅"
        if (progress < 25) return "Initializing..."
        if (progress < 50) return "Processing data..."
        if (progress < 75) return "Almost there..."
        return "Finalizing..."
    }

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen pb-[45vh] ${progress >= 100 ? 'complete' : ''}`}>
            <Progress value={progress} className="w-[60%]" />
            <p className="mt-4 text-lg">{getMessage(progress)}</p>
        </div>
    )
}
