"use client"

import { Providers } from "@/app/providers"
import { TooltipProvider } from "@/components/ui/tooltip"
import pomodoroStore from "@/store/pomodoroStore"

import QuickActions from "@/components/quick-actions/quick-actions"
import PomodoroTimer from "@/components/pomodoro-timer/pomodoroTimer"

export default function Wrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { show: pomodoroShow } = pomodoroStore()

    return (
        <>
            <TooltipProvider>
                <Providers>
                    {children}
                </Providers>
                <QuickActions />
                {pomodoroShow && <PomodoroTimer />}
            </TooltipProvider>
        </>
    )
}
