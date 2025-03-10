"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Send, Upload } from "lucide-react"
import { toast } from "sonner" // For notifications

const BACKEND = process.env.BACKEND || 'http://localhost:8080'

export function SearchEngine({ onNewMessage }: { onNewMessage: (message: string) => void }) {
  const [inputValue, setInputValue] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const router = useRouter()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("File selected:", selectedFile.name)
      await uploadFile(selectedFile)
    }
  }

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)
    try {
      const response = await fetch(`${BACKEND}/upload/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const data = await response.json()
      console.log("File upload response:", data)
      toast.success("File uploaded successfully!", {
        description: `File "${file.name}" has been uploaded.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file", {
        description: "An error occurred. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearch = async () => {
    console.log("Current Input:", inputValue)
    onNewMessage(inputValue)

    const response = await fetch(`${BACKEND}/agent/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPrompt: inputValue,
        audioId: "",
      }),
    })

    const data = await response.json()
    console.log("Response received:", data)
  }


  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-full flex items-center max-w-2xl">
        <Input
          placeholder="Ask me anything..."
          className="w-full rounded-lg px-6 py-6 text-lg shadow-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(); 
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          
        </div>
        <Label htmlFor="file-upload">
          <Button 
          size = "lg" 
          className="text-gray-400 bg-transparent border-none hover:bg-transparent hover:text-blue-500" 
          disabled={isUploading}>
            {isUploading ? "Uploading..." : <Upload />}
          </Button>
        </Label>
        <Button
          size = "lg"
          onClick={handleSearch}
          className="text-gray-400 bg-transparent border-none hover:bg-transparent hover:text-blue-500"
        >
          <Send />
        </Button>
      </div>
    </div>
  )
}