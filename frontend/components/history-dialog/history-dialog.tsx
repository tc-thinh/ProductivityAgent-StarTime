"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import useDebounce from "@/hooks/use-debounce"
import { fetchBackendService } from "@/lib/utils"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
import { Plus } from "lucide-react"

interface SearchResult {
    c_id: number,
    c_name: string,
    c_created_at: Date,
    headline: string
}

export function HistoryDialog() {
    const [open, setOpen] = useState(false)

    const [hoveredItem, setHoveredItem] = useState<SearchResult | null>(null)
    const [query, setQuery] = useState("")
    const [result, setResult] = useState<SearchResult[]>([])
    const debouncedQuery = useDebounce(query, 200)
    const { hydrated, accessToken } = useUserStore()

    const handleMouseEnter = (item: SearchResult) => {
        setHoveredItem(item)
    }

    const handleMouseLeave = () => {
        setHoveredItem(null)
    }

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

            const normalizedQuery = debouncedQuery.toLowerCase().trim()
            const { success, data } = await fetchBackendService<SearchResult[]>(
                {
                    endpoint: `database/conversations/search/?token=${accessToken}&&search_query=${normalizedQuery}`,
                    method: "GET"
                }
            )

            if (!success) toast.error("Something went wrong. Please try again later")

            console.log(data)
            setResult(data || [])
        }

        fetchData()
    }, [hydrated, accessToken, debouncedQuery])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent
                className="overflow-hidden p-0 md:max-h-[70%] md:max-w-[50%] lg:max-w-[50%]"
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>Search Previous Conversations</DialogTitle>
                    <DialogDescription>
                        Search for your previous conversations by name or content. Click on a conversation to navigate to it.
                    </DialogDescription>
                </DialogHeader>
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

                    <div className="flex flex-1 flex-col overflow-y-auto p-4 pt-0">
                        <Button
                            variant="ghost"
                            className="gap-2 px-2 my-2 items-left"
                            onClick={() => {
                                window.location.href = "/"
                            }}
                        >
                            <Plus className="w-6 h-6" />
                            <p className="text-lg">Create new conversation</p>
                        </Button>

                        {result.length > 0 ? (
                            result.map((item) => (
                                <div
                                    key={item.c_id}
                                    className="flex flex-row w-full"
                                    onMouseEnter={() => handleMouseEnter(item)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <Button
                                        variant="ghost"
                                        className="w-full h-full"
                                        onClick={() => {
                                            window.location.href = `/${item.c_id}`;
                                        }}
                                    >
                                        <div
                                            className={`flex flex-col items-left ${hoveredItem?.c_id === item.c_id ? "w-[85%]" : "w-full"}`}
                                        >
                                            <div className="items-left text-left pl-2">
                                                <h3 className="text-lg font-semibold truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {item.c_name}
                                                </h3>
                                            </div>
                                            <p
                                                className="text-sm text-muted-foreground items-left text-left pl-2 mt-1 truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                                dangerouslySetInnerHTML={{ __html: item.headline }}
                                            ></p>
                                        </div>

                                        {hoveredItem?.c_id === item.c_id && (
                                            <div className="w-[30%] text-sm text-muted-foreground items-right text-right pl-2 mt-1 truncate overflow-hidden text-ellipsis whitespace-nowrap">
                                                {(() => {
                                                    const createdDate = new Date(item.c_created_at);
                                                    const today = new Date();
                                                    const yesterday = new Date();
                                                    yesterday.setDate(today.getDate() - 1);

                                                    if (
                                                        createdDate.getFullYear() === yesterday.getFullYear() &&
                                                        createdDate.getMonth() === yesterday.getMonth() &&
                                                        createdDate.getDate() === yesterday.getDate()
                                                    ) {
                                                        return "Yesterday";
                                                    }

                                                    return createdDate.toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    });
                                                })()}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="ml-3 text-muted-foreground">No results found.</p>
                        )}
                    </div>
                </main>
            </DialogContent>
        </Dialog>
    )
}
