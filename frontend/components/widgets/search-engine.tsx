"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Upload } from "lucide-react"
import { H1, H5, Icon } from "@blueprintjs/core";

export function SearchEngine() {
  const [file, setFile] = useState<File | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("File selected:", selectedFile.name)
      // You can add file upload logic here (e.g., send to an API)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-3xl">
      {/* App Name */}
      {/* <h1 className="text-5xl font-bold text-gray-900 mb-6">It's StarTime!</h1> */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {/* <Icon icon="chat" /> */}
        <H1>It's <span style={{ color: "#106ba3" }}>StarTime!</span></H1>
        <H5>Scheduling your day, so you can chase the Stars. 🌟✨</H5>
      </div>

      {/* Search Bar */}
      <div className="w-full flex flex-col items-center gap-6">
        <div className="relative w-full max-w-2xl">
          <Input
            placeholder="Ask me anything..."
            className="w-full rounded-lg px-6 py-6 text-lg shadow-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="size-5 text-gray-400" />
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