import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Icon } from "lucide-react"
import { fruit } from "@lucide/lab"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export default function QuickActions() {
    return (
        <TooltipProvider>
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
                        <TooltipContent>
                            <p>Open Quick Actions</p>
                        </TooltipContent>
                    </Tooltip>

                    <PopoverContent style={{ width: "3rem" }}>
                        <Tooltip>
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
                                >
                                    <Icon iconNode={fruit} size="3rem" /> 
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Pomodoro</p>
                            </TooltipContent>
                        </Tooltip>
                    </PopoverContent>
                </Popover>
            </div>
        </TooltipProvider>
    )
}
