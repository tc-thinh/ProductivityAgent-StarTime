"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function HistoryDialog() {
    const [open, setOpen] = React.useState(true)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                <DialogTitle className="sr-only">Settings</DialogTitle>
                <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
                    <header className="flex flex-col pt-2 h-[10%] shrink-0 items-center gap-1 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <Input
                            type="text"
                            placeholder="Search previous conversation..."
                            className="w-full h-full border-none focus:outline-none focus:ring-0 focus-visible:ring-0 appearance-none shadow-none"
                            style={{ fontSize: "1.25rem" }}
                        />
                        <hr className="w-full border-t border-gray-300" />
                    </header>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                    </div>
                </main>
            </DialogContent>
        </Dialog>
    )
}
