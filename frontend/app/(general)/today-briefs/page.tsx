"use client"

import { useEffect, useState } from 'react'

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export default function TodayBriefs() {
    const [taskBrief, setTaskBrief] = useState<string>('')
    const [eventBrief, setEventBrief] = useState<string>('')
    const [newsBrief, setNewsBrief] = useState<string>('')

    useEffect(() => {
        fetch(`${HTTP_BACKEND}/database/briefs/tasks/`)
            .then(response => response.json())
            .then(data => {
                setTaskBrief(data.taskBrief)
            })
            .catch(error => {
                console.error("Can't fetch data, use mock instead:", error)
                setTaskBrief('Task Brief')
            })

        fetch(`${HTTP_BACKEND}/database/briefs/events/`)
            .then(response => response.json())
            .then(data => {
                setEventBrief(data.eventBrief)
            })
            .catch(error => {
                console.error("Can't fetch data, use mock instead:", error)
                setEventBrief('Event Brief')
            })

        fetch(`${HTTP_BACKEND}/database/briefs/news/`)
            .then(response => response.json())
            .then(data => {
                setNewsBrief(data.newsBrief)
            })
            .catch(error => {
                console.error("Can't fetch data, use mock instead:", error)
                setNewsBrief('News Brief')
            })
    }, [])

    return (
        <>
            <p>Hello</p>
        </>
    )
}
