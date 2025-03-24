"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import pomodoroStore from "@/store/pomodoroStore"
import { Play, Pause, RotateCcw, X } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"

const PomodoroTimer = () => {
    const {
        timeLeft,
        isRunning,
        start,
        pause,
        reset,
        tick,
        hydrated,
        turnOff,
        backgroundColor,
        foregroundColor,
        pomodoroStatus
    } = pomodoroStore()
    const [compactMode, setCompactMode] = useState(false)

    // Local state to track hydration
    const [isHydrated, setIsHydrated] = useState(false)

    // Ensure hydration is properly tracked
    useEffect(() => {
        if (hydrated) {
            setIsHydrated(true)
        }
    }, [hydrated])

    const requestNotificationPermission = () => {
        if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then((permission) => {
                    if (permission !== "granted") {
                        console.warn("Notifications are disabled.")
                    }
                })
            }
        }
    }

    useEffect(() => {
        requestNotificationPermission();
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            tick()
        }, 1000)
        return () => clearInterval(interval)
    }, [tick])

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const buttonStyle = {
        background: foregroundColor,
        color: backgroundColor,
        border: "none",
        padding: "0.3rem",
    }

    const startPomodoro = (e) => {
        e.stopPropagation()
        start()
    }

    const pausePomodoro = (e) => {
        e.stopPropagation()
        pause()
    }

    const resetPomodoro = (e) => {
        e.stopPropagation()
        reset()
    }

    const turnOffPomodoro = (e) => {
        e.stopPropagation()
        setCompactMode(false)
        turnOff()
    }

    return (
        <div
            style={{
                position: "fixed",
                top: "20%",
                right: 0,
                padding: compactMode ? "0.5rem" : "1rem",
                background: backgroundColor,
                color: foregroundColor,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
            }}
            onClick={() => setCompactMode(!compactMode)}
        >
            {!compactMode && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={turnOffPomodoro}
                            style={{
                                position: "absolute",
                                top: "-0.5rem",
                                left: "-0.5rem",
                                border: "none",
                                cursor: "pointer",
                                ...buttonStyle
                            }}
                            className="h-auto w-auto"
                        >
                            <X size="0.5rem" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={10}>
                        <p>Exit</p>
                    </TooltipContent>
                </Tooltip>
            )}

            {/* Timer / Loading Message */}
            {isHydrated ? (
                <>
                    <Tooltip>
                        <TooltipTrigger>
                            <div
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    minWidth: "3rem"
                                }}
                            >
                                {minutes}:{seconds.toString().padStart(2, "0")}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" sideOffset={compactMode ? 15 : 30}>
                            <p>{pomodoroStatus}</p>
                        </TooltipContent>
                    </Tooltip>

                    {!compactMode && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem"
                            }}
                        >
                            <Tooltip>
                                <TooltipTrigger>
                                    {!isRunning ? (
                                        <Button
                                            onClick={startPomodoro}
                                            style={buttonStyle}
                                            className="h-auto w-auto"
                                        >
                                            <Play size="1rem" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={pausePomodoro}
                                            style={buttonStyle}
                                            className="h-auto w-auto"
                                        >
                                            <Pause size="1rem" />
                                        </Button>
                                    )}
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={20}>
                                    <p>{!isRunning ? "Start" : "Pause"}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        onClick={resetPomodoro}
                                        style={buttonStyle}
                                        className="h-auto w-auto"
                                    >
                                        <RotateCcw size="1rem" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={20}>
                                    <p>Reset</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </>
            ) : (
                <div
                    style={{
                        fontSize: "1rem",
                        fontWeight: "bold"
                    }}
                >
                    <p>Loading...</p>
                </div>
            )}
        </div>
    )
}

export default PomodoroTimer
