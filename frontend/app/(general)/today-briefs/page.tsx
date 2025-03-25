"use client"

import { useEffect, useState } from 'react'

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export default function TodayBriefs() {
    const [taskBrief, setTaskBrief] = useState<string>('')
    const [eventBrief, setEventBrief] = useState<string>('')
    const [newsBrief, setNewsBrief] = useState<string>('')

    useEffect(() => {
    }, [])

    return (
        <>
            <p>Hello</p>
        </>
    )
}
