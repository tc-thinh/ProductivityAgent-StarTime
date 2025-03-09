"use client"

import { SearchEngine } from "@/components/widgets/search-engine"

export default function Landing() {
  return (
    <>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <SearchEngine />
        </div>
    </>
  )
}