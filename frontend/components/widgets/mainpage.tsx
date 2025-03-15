"use client"

import { SearchEngine } from "@/components/search-engine/search-engine"

export default function Landing() {
  return (
    <>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {/* <Icon icon="chat" /> */}
            <h1>It's <span style={{ color: "#106ba3" }}>StarTime!</span></h1>
            <h5>Scheduling your day, so you can chase the Stars. 🌟✨</h5>
          </div>

          <SearchEngine />
        </div>
    </>
  )
}