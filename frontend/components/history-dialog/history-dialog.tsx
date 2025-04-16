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
import { useState, useEffect } from "react"
import useDebounce from "@/hooks/use-debounce"
import { fetchBackendService } from "@/lib/utils"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"

interface SearchResult {
    c_id: string,
    c_name: string,
    c_headline: string
}

export function HistoryDialog() {
    const [open, setOpen] = useState(true)

    const [query, setQuery] = useState("")
    const [result, setResult] = useState<SearchResult[]>([])
    const debouncedQuery = useDebounce(query, 200)
    const { hydrated, accessToken } = useUserStore()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    useEffect(() => {
        if (!accessToken) return

        const fetchData = async () => {
            if (!debouncedQuery) {
                setResult([])
                return
            }

            console.log(accessToken)
            const normalizedQuery = debouncedQuery.toLowerCase().trim()
            const { success, data } = await fetchBackendService<SearchResult[]>(
                {
                    endpoint: `database/conversations/search/?token=${accessToken}&&search_query=${normalizedQuery}`,
                    method: "GET"
                }
            )

            setResult(data || [])
            if (!success) toast.error("Something went wrong. Please try again later")
        }

        fetchData()
    }, [hydrated, accessToken, debouncedQuery])

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
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search previous conversation..."
                            className="w-full h-full border-none focus:outline-none focus:ring-0 focus-visible:ring-0 appearance-none shadow-none"
                            style={{ fontSize: "1.25rem" }}
                        />
                        <hr className="w-full border-t border-gray-300" />
                    </header>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                        {result.length > 0 ? (
                            result.map((item) => (
                                <div key={item.c_id} className="border rounded p-4">
                                    <h3 className="text-lg font-semibold">{item.c_name}</h3>
                                    <p className="text-sm text-muted-foreground">{item.c_headline}</p>
                                </div>
                            ))
                        ) : (
                            debouncedQuery && <p className="text-muted-foreground">No results found.</p>
                        )}
                    </div>
                </main>
            </DialogContent>
        </Dialog>
    )
}
