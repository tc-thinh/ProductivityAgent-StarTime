"use client"

import { SearchEngine } from "@/components/widgets/search-engine"

export default function Landing() {
  return (
    <>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1>It is <span style={{ color: "#106ba3" }}>StarTime!</span></h1>
            <h5>Scheduling your day, so you can chase the Stars. 🌟✨</h5>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 w-full max-w-3xl">
            <div className="w-full flex flex-col items-center gap-6">
              <SearchEngine onNewMessage={(message => console.log(message))} />
            </div>
          </div>
        </div>
    </>
  )
}