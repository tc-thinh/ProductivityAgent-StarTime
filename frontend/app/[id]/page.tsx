"use client"

import { useParams } from "next/navigation"

export default function ChatCanvas()  {
    const { id } = useParams()

    return (
        <div>
            <h1>This is a chat for section id: {id}</h1>
        </div>
    )
}