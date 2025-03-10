"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Upload } from "lucide-react"
import { useSession } from "next-auth/react"

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export function SearchEngine() {
  // TODO: Migrate these components to Blueprint.js\
  const [inputValue, setInputValue] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("File selected:", selectedFile.name)
      // You can add file upload logic here (e.g., send to an API)
    }
  }

  const router = useRouter()

  const handleSearch = async () => {
    console.log("Current Input:", inputValue)

    const response = await fetch(HTTP_BACKEND + "/agent/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
      },
      body: JSON.stringify({
        "userPrompt": inputValue,
        "audioId": "",
      }),
    });

    const data = await response.json();
    console.log(data)

    router.push(`/${data.conversationId}`)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-3xl">
      {/* App Name */}
      {/* <h1 className="text-5xl font-bold text-gray-900 mb-6">It's StarTime!</h1> */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {/* <Icon icon="chat" /> */}
        <h1>It's <span style={{ color: "#106ba3" }}>StarTime!</span></h1>
        <h5>Scheduling your day, so you can chase the Stars. 🌟✨</h5>
      </div>

      {/* Search Bar */}
      <div className="w-full flex flex-col items-center gap-6">
      <div className="relative w-full max-w-2xl">
          <Input
            placeholder="Ask me anything..."
            className="w-full rounded-lg px-6 py-6 text-lg shadow-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Button onClick={handleSearch} className="text-gray-400 bg-transparent border-none hover:bg-transparent hover:text-blue-500">
            <Search />
          </Button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button className="rounded-lg px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white">
            <Search className="mr-2 size-5" />
            Search
          </Button>

          {/* File Upload Button */}
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                className="rounded-lg px-8 py-3 text-lg border-gray-300 hover:bg-gray-100"
                asChild
              >
                <div>
                  <Upload className="mr-2 size-5" />
                  Upload File
                </div>
              </Button>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}