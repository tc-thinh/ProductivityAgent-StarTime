"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CircleStop, Send, AudioLines, Images } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { DialogTitle } from '@radix-ui/react-dialog'
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024

interface SearchEngineProps {
  handleSearch: (
    promptText: string,
    voiceTranscript: string,
    images: File[]
  ) => void
}

export function SearchEngine({ handleSearch }: SearchEngineProps) {
  const isDay = new Date().getHours() < 11 && new Date().getHours() > 6
  const isNight = new Date().getHours() > 18 || new Date().getHours() < 6

  // State declarations
  const [inputValue, setInputValue] = useState<string>("")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamic height calculation for CardContent
  const newLineCount = (inputValue.match(/\n/g) || []).length
  const maxLines = 10
  const initialHeight = 50
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight

  // Set up SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsRecording(true)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current.onresult = (event) => {
          const newTranscript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("")
          setTranscript(newTranscript)
        }
      } else {
        console.error("Speech recognition not supported in this browser")
        toast.error("Speech recognition not supported in this browser")
      }

      return () => {
        recognitionRef.current?.stop()
      }
    }
  }, [])

  // Handle Enter key press for search
  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      // promptText: string, voiceTranscript: string, images: File[]
      await handleSearch(inputValue, transcript, images)
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile()
        if (!file) return
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`${file.name || "Pasted image"} exceeds the ${MAX_IMAGE_SIZE_MB}MB size limit.`)
          return
        }
        setImages((prevImages) => [...prevImages, file])
        const imageUrl = URL.createObjectURL(file)
        setImagePreviews((prevPreviews) => [...prevPreviews, imageUrl])
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imageFiles = Array.from(files).filter((file) => {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`${file.name} exceeds the ${MAX_IMAGE_SIZE_MB}MB size limit.`)
          return false
        }
        return true
      })

      setImages((prevImages) => [...prevImages, ...imageFiles])
      const newImagePreviews = imageFiles.map((file) => URL.createObjectURL(file))
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newImagePreviews])
    }
  }

  const handleAttachButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current?.start()
    }
  }

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, revoking all blob URLs")
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, []) // Explicitly empty to ensure it only runs on unmount

  // Handle image deletion
  const handleDeleteImage = (index: number) => {
    console.log("Deleting image at index:", index, "Current selected index:", selectedImageIndex)
    const newImages = images.filter((_, i) => i !== index)
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index)

    // Revoke the URL of the deleted image immediately
    URL.revokeObjectURL(imagePreviews[index])

    setImages(newImages)
    setImagePreviews(newImagePreviews)

    // Adjust selectedImageIndex
    if (newImagePreviews.length === 0) {
      setSelectedImageIndex(null)
    } else if (selectedImageIndex === index) {
      setSelectedImageIndex(newImagePreviews.length > 0 ? 0 : null) // Default to first image
    } else if (selectedImageIndex !== null && index < selectedImageIndex) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
    console.log("New previews length:", newImagePreviews.length, "New selected index:", selectedImageIndex)
  }

  // Handle image selection
  const handleImageSelect = (index: number) => {
    console.log("Selecting image at index:", index)
    setSelectedImageIndex(index)
  }

  return (
    <div className="w-full justify-content-center flex flex-col items-center transition-all duration-300">
      {/* Transcript Textarea (Secondary Panel) */}
      <div className="w-[75vh] bg-gray-100 shadow-lg">
        {transcript && (
          <div>
            <Textarea
              className="text-sm bg-transparent text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 p-3"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              disabled={isRecording}
            />
          </div>
        )}
      </div>

      {/* Main Search Card */}
      <Card className="w-[80vh] mx-auto bg-white border border-gray-200 shadow-lg transition-all duration-300 mt-0">
        <CardContent style={{ height: `${cardHeight}px` }}>
          <Textarea
            ref={textareaRef}
            placeholder={`How can I help you ${isDay ? "this morning" : isNight ? "this evening" : "today"}?`}
            className={`w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 ${newLineCount < maxLines ? "cursor-transparent" : ""
              }`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={8}
            onPaste={handlePaste}
          />
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          {/* Image Previews on the Left with Horizontal Scrolling */}
          <div className="flex items-center space-x-2 overflow-x-auto max-w-[400px] [&::-webkit-scrollbar]:w-2[&::-webkit-scrollbar]:h-2[&::-webkit-scrollbar-track]:bg-gray-100[&::-webkit-scrollbar-thumb]:bg-gray-300dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            {imagePreviews.map((preview, index) => (
              <Drawer key={preview}>

                <DrawerTrigger asChild>
                  <div className="relative flex-shrink-0 cursor-pointer">
                    <Image
                      src={preview}
                      alt={`Uploaded preview ${index}`}
                      width={48}
                      height={48}
                      className="w-[2rem] h-[2rem] object-cover"
                      onClick={() => handleImageSelect(index)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(index)
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </DrawerTrigger>

                <DrawerContent aria-label="Image Preview">
                  <VisuallyHidden>
                    <DialogTitle>Image Preview</DialogTitle>
                  </VisuallyHidden>

                  <div className="p-4 flex justify-center items-center">
                    {selectedImageIndex !== null &&
                      selectedImageIndex >= 0 &&
                      selectedImageIndex < imagePreviews.length ? (
                      <Image
                        src={imagePreviews[selectedImageIndex]}
                        alt="Preview in drawer"
                        width={200}
                        height={100}
                        className="w-auto h-auto max-w-full max-h-[50vh] object-contain rounded-lg"
                      />
                    ) : (
                      <p>No image selected or invalid selection.</p>
                    )}
                  </div>
                </DrawerContent>

              </Drawer>
            ))}
          </div>

          {/* Action Buttons on the Right */}
          <div className="flex space-x-2">
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="relative flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  type="button"
                  variant={"ghost"}
                  onClick={handleAttachButtonClick}
                >
                  <Images className="h-4 w-4" />
                  {images.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs text-[10px] p-0"
                    >
                      {images.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Show Attached Images</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={"ghost"}
                  size="icon"
                  onClick={toggleRecording}
                  className={`flex-shrink-0 transition-all ${isRecording
                    ? "text-white bg-red-500 hover:bg-red-600"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                >
                  {isRecording ? (
                    <CircleStop className="h-4 w-4" />
                  ) : (
                    <AudioLines className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isRecording ? "Stop Listening" : "Start Listening"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  disabled={!inputValue.trim()}
                  className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  onClick={() => handleSearch(inputValue, transcript, images)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Send</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
