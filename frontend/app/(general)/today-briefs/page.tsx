"use client"

import { useEffect, useState } from 'react'
import UnderConstruction from '@/components/construction-page/under-construction'

export default function TodayBriefs() {
    const [taskBrief, setTaskBrief] = useState<string>('')
    const [eventBrief, setEventBrief] = useState<string>('')
    const [newsBrief, setNewsBrief] = useState<string>('')

    useEffect(() => {
    }, [])

  return <UnderConstruction />;
}
