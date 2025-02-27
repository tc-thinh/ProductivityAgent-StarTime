"use client"

import { useEffect, useState } from "react"

const BACKEND = process.env.BACKEND || 'http://localhost:8080'

interface Category {
    c_id: number
    c_color_id: string
    c_title: string
    c_description: string
    c_background: string
    c_foreground: string
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([])
    useEffect(() => {
        fetch(`${BACKEND}/database/categories/`)
        .then(response => response.json())
        .then(data => setCategories(data))
    }, [])

    return (
        <div>
            <ul>
                {categories.map(category => <li key={category.c_id}>{category.c_title}</li>)}
            </ul>
        </div>
    )
}
