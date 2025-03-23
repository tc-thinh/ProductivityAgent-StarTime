"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Plus,
    Icon,
    StickyNote,
    ShoppingCart,
    ListTodo
} from "lucide-react"
import {
    fruit,
    gridLines,
} from "@lucide/lab"

import pomodoroStore from "@/store/pomodoroStore"

// Define the type for the icon
type IconType = JSX.Element

function getIcon(icon: [elementName: any, attrs: Record<string, string>][]): JSX.Element {
    return <Icon iconNode={icon} size="3rem" />;
}

export default function QuickActions() {
    const { turnOn: pomodoroTurnOn } = pomodoroStore()

    // Define the type for actions
    type Action = {
        title: string
        icon: IconType
        onClick: () => void
    }

    // MOST -> LEAST important  
    const actions: Action[] = [
        {
            title: "Pomodoro Timer",
            icon: <>{getIcon(fruit)}</>,
            onClick: () => { pomodoroTurnOn() }
        },
        {
            title: "Pop-up Notes",
            icon: <StickyNote size="3rem" />,
            onClick: () => {}
        },
        {
            title: "Habit Tracker",
            icon: <>{getIcon(gridLines)}</>,
            onClick: () => {}
        },
        {
            title: "Bucket List",
            icon: <ListTodo size="3rem" />,
            onClick: () => {}
        },
        {
           title: "Shopping List",
           icon: <ShoppingCart size="3rem" />,
           onClick: () => {}
        }
    ]

    return (
        <div style={{ position: "fixed", bottom: "3rem", right: "3rem" }}>
            <Popover>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                style={{
                                    width: "3rem",
                                    height: "3rem",
                                    padding: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Plus size="3rem" />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Open Quick Actions</p>
                    </TooltipContent>
                </Tooltip>

                <PopoverContent style={{ width: "3rem" }}>
                    {actions
                        .slice()
                        .reverse()
                        .map((action, index) => (
                            <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                    <Button
                                        style={{
                                            width: "100%",
                                            height: "3rem",
                                            display: "flex",
                                            padding: 0,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "transparent",
                                            color: "var(--color-primary)",
                                        }}
                                        onClick={action.onClick}
                                    >
                                        {action.icon}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>{action.title}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                </PopoverContent>
            </Popover>
        </div>
    )
}