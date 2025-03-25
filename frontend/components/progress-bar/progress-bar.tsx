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
        const firstTimeout = setTimeout(() => {
            setProgress(Math.floor(initPercentage + (100 - initPercentage) / 2))
        }, Math.floor(timeDone / 2))

        const secondTimeout = setTimeout(() => {
            setProgress(100)
        }, timeDone)

        return () => {
            clearTimeout(firstTimeout)
            clearTimeout(secondTimeout)
        }
    }, [])

    return (
        <div className="flex items-center justify-center min-h-screen pb-[45vh]">
            <Progress value={progress} className="w-[60%]" />
        </div>
    )
}