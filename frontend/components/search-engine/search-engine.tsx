"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CircleStop, Send, AudioLines, Images, Wrench } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
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
import  HashtagDropdown  from "@/components/search-engine/hashtag-dropdown"

const MAX_IMAGE_SIZE_MB = 5
const MAX_IMAGE_SIZE = MAX_IMAGE_SIZE_MB * 1024 * 1024

// Define the available tools
const availableTools = [
  { id: 'google-calendar', name: 'Google Calendar', logo: '/logos/google-calendar.png' },
  { id: 'spotify', name: 'Spotify', logo: '/logos/spotify.png' },
  { id: 'youtube', name: 'YouTube', logo: '/logos/youtube.png' },
  { id: 'google-docs', name: 'Google Docs', logo: '/logos/google-docs.png' },
  { id: 'gmail', name: 'Gmail', logo: '/logos/gmail.png' },
  { id: 'google-maps', name: 'Google Maps', logo: '/logos/google-maps.png' },
  { id: 'google-drive', name: 'Google Drive', logo: '/logos/google-drive.png' },
]

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

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [triggeredByHash, setTriggeredByHash] = useState(false)
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null)
  const [dropdownSearch, setDropdownSearch] = useState("")

  const [hashtagDropdownOpen, setHashtagDropdownOpen] = useState(false);
  const [hashtagPosition, setHashtagPosition] = useState({ top: 0, left: 0 });
  const [currentHashtagRange, setCurrentHashtagRange] = useState({ start: 0, end: 0 });

  // State declarations
  const [inputValue, setInputValue] = useState<string>("")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<Array<{
    url: string;
    size: number;
    name: string;
    type: string;
  }>>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamic height calculation for CardContent
  const newLineCount = (inputValue.match(/\n/g) || []).length
  const maxLines = 10
  const initialHeight = 50
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight

  // Get the last selected tool logo
  const currentToolLogo = useMemo(() => {
    // Extract all tool mentions from input text
    const mentions = inputValue.match(/#([^\s#]+)/g) || [];
    
    // Find the last mentioned tool
    for (let i = mentions.length - 1; i >= 0; i--) {
      const mention = mentions[i].slice(1).toLowerCase(); // Remove # and normalize
      const tool = availableTools.find(t => 
        t.name.toLowerCase().replace(/\s+/g, '-') === mention ||
        t.name.toLowerCase().replace(/\s+/g, '') === mention
      );
      if (tool) return tool.logo;
    }
    return null;
  }, [inputValue]);
  
  
  console.log("Selected tools:", selectedTools)
  console.log("Current tool logo:", currentToolLogo)


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

        recognitionRef.current.onresult = (event: any) => {
          const newTranscript = Array.from(event.results)
            .map((result: any) => result[0]?.transcript)
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

  const reset = () => {
    setInputValue("")
    setTranscript("")
    setImagePreviews([])
    setSelectedImageIndex(null)
    setIsRecording(false)
    setImages([])
  }

  // Handle Enter key press for search
  const handleKeyPress = async (event: React.KeyboardEvent) => {
    if (hashtagDropdownOpen && event.key === "Enter") {
      return; // dropdown will handle it
    }
  
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
  
      const currentText = textareaRef.current?.value ?? inputValue;
  
      if (currentText.trim() || transcript.trim()) {
        await handleSearch(currentText, transcript, images);
        reset();
      }
    }
  };
  
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
        const imageUrl = {
          url: URL.createObjectURL(file),
          size: file.size,
          name: file.name || `pasted-image-${Date.now()}`,
          type: file.type
        }
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
      const newImagePreviews = imageFiles.map((file) => ({
        url: URL.createObjectURL(file),
        size: file.size,
        name: file.name,
        type: file.type
      }))
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

  // Update the cleanup effect:
  useEffect(() => {
    return () => {
      console.log("Component unmounting, revoking all blob URLs")
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, []) // Explicitly empty to ensure it only runs on unmount

  // Handle image deletion
  const handleDeleteImage = (index: number) => {
    console.log("Deleting image at index:", index, "Current selected index:", selectedImageIndex)
    
    // Create new arrays without the deleted image
    const newImages = images.filter((_, i) => i !== index)
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index)
  
    // Revoke the URL of the deleted image immediately
    URL.revokeObjectURL(imagePreviews[index].url)
  
    // Update state
    setImages(newImages)
    setImagePreviews(newImagePreviews)
  
    // Adjust selectedImageIndex
    if (newImagePreviews.length === 0) {
      setSelectedImageIndex(null)
    } else if (selectedImageIndex === index) {
      // If deleting the currently selected image, select the first one (or null if none left)
      setSelectedImageIndex(newImagePreviews.length > 0 ? 0 : null)
    } else if (selectedImageIndex !== null && index < selectedImageIndex) {
      // If deleting an image before the selected one, adjust the index
      setSelectedImageIndex(selectedImageIndex - 1)
    } else if (selectedImageIndex !== null && index > selectedImageIndex) {
      // If deleting an image after the selected one, no need to adjust
      setSelectedImageIndex(selectedImageIndex)
    }
  
    console.log("New previews length:", newImagePreviews.length, "New selected index:", selectedImageIndex)
  }

  // Handle image selection
  const handleImageSelect = (index: number) => {
    console.log("Selecting image at index:", index)
    setSelectedImageIndex(index)
  }


  const extractToolMentions = (text: string): string[] => {
    // Match # followed by any characters until space or end of string
    const matches = text.match(/#([^\s]+)/g) || []
    return matches
  }

  // Enhanced handleToolSelect function
  const handleToolSelect = (toolId: string) => {
    const tool = availableTools.find(t => t.id === toolId)
    if (!tool) return
  
    // Replace spaces with hyphens in the mention
    const toolMention = `#${tool.name.replace(/\s/g, '-')} `
  
    if (triggeredByHash) {
      setInputValue(prev => prev.slice(0, -1) + toolMention)
      setTriggeredByHash(false)
    } else {
      setInputValue(prev => `${prev}${prev ? ' ' : ''}${toolMention}`)
    }
  
    setDropdownOpen(false)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  useEffect(() => {
    const toolMentions = extractToolMentions(inputValue)
    const mentionedTools = availableTools.filter(tool => 
      toolMentions.includes(`#${tool.name.replace(/\s/g, '-')}`) || 
      toolMentions.includes(`#${tool.name}`)
    )
    setSelectedTools(mentionedTools.map(tool => tool.id))
  }, [inputValue])
  

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
  
    // Get cursor position
    const cursorPos = e.target.selectionStart;
    const textUpToCursor = value.slice(0, cursorPos);
  
    // Find the last unclosed hashtag
    const lastHashtagIndex = textUpToCursor.lastIndexOf('#');
    const hasUnclosedHashtag = lastHashtagIndex >= 0 && 
                              !textUpToCursor.slice(lastHashtagIndex).includes(' ');
  
    if (hasUnclosedHashtag) {
      // Calculate dropdown position near the cursor
      const textarea = textareaRef.current;
      if (textarea) {
        // Create a temporary span to measure the position
        const span = document.createElement('span');
        span.textContent = textUpToCursor.slice(0, lastHashtagIndex);
        span.style.visibility = 'hidden';
        span.style.whiteSpace = 'pre-wrap';
        span.style.font = window.getComputedStyle(textarea).font;
        document.body.appendChild(span);
        
        const rect = span.getBoundingClientRect();
        const textareaRect = textarea.getBoundingClientRect();
        
        setHashtagPosition({
          top: textareaRect.top + textarea.scrollTop + rect.height + 5,
          left: textareaRect.left + span.offsetWidth
        });
        
        document.body.removeChild(span);
      }
  
      setCurrentHashtagRange({
        start: lastHashtagIndex,
        end: cursorPos
      });
      
      setDropdownSearch(textUpToCursor.slice(lastHashtagIndex + 1).toLowerCase());
      setHashtagDropdownOpen(true);
    } else {
      setHashtagDropdownOpen(false);
    }
  };

  const handleHashtagToolSelect = (toolId: string) => {
    const tool = availableTools.find(t => t.id === toolId);
    if (!tool || !textareaRef.current) return;
  
    const text = inputValue;
    const { start, end } = currentHashtagRange;
    
    // Replace the hashtag and search term with the full tool name
    const newText = 
      text.slice(0, start) + 
      `#${tool.name.replace(/\s/g, '-')} ` + 
      text.slice(end);
  
    setInputValue(newText);
    setHashtagDropdownOpen(false);
    
    // Focus back on the textarea and position cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + tool.name.length + 2; // +2 for # and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  const ToolsDropdown = () => {
    return (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        {/* Hidden trigger that we'll use programmatically */}
        <DropdownMenuTrigger asChild>
          <Button
            ref={dropdownTriggerRef}
            className="absolute opacity-0 w-0 h-0"
            aria-hidden
          />
        </DropdownMenuTrigger>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center text-muted-foreground hover:text-foreground h-9 w-9"
              onClick={() => {
                setTriggeredByHash(false)
                setDropdownOpen(!dropdownOpen)
              }}
            >
              {currentToolLogo ? (
                <div className="relative h-5 w-5">
                  <Image
                    src={currentToolLogo}
                    alt={`Selected tool logo`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              {selectedTools.length > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs text-[10px] p-0"
                >
                  {selectedTools.length}
                </Badge>
              )}
            </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {selectedTools.length === 1 ? (
                // Show tool name for single selection
                availableTools.find(t => t.id === selectedTools[0])?.name || 'Tool selected'
              ) : selectedTools.length > 1 ? (
                // Show count for multiple selections
                `${selectedTools.length} tools selected`
              ) : (
                // Default text
                'Select tools (or type #)'
              )}
            </p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent align="end" className="w-[20vh]">
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Apps & Tools
        </div>
        {availableTools
          .filter(tool => 
            tool.name.toLowerCase().includes(dropdownSearch)
          )
          .map((tool) => (
            <DropdownMenuItem
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="relative h-5 w-5">
                <Image
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span>{tool.name}</span>
            </DropdownMenuItem>
        ))}
        {availableTools.filter(tool => tool.name.toLowerCase().includes(dropdownSearch)).length === 0 && (
          <div className="px-4 py-2 text-muted-foreground text-sm">
            No tools found
          </div>
        )}

      </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <div className="w-full justify-content-center flex flex-col items-center transition-all duration-300">
      {/* Transcript Textarea (Secondary Panel) */}
      <div className="w-[75vh] bg-gray-100">
        {transcript && (
          <div className="rounded-lg">
            <Textarea
              className="text-lg resize-none p-3"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              disabled={isRecording}
            />
          </div>
        )}
      </div>

      {/* Main Search Card */}
      <Card className="w-[80vh] mx-auto bg-white border border-gray-200 shadow-lg transition-all duration-300 mt-0 rounded-lg">
        <CardContent style={{ height: `${cardHeight}px` }}>
            <Textarea
              ref={textareaRef}
              placeholder={`How can I help you ${isDay ? "this morning" : isNight ? "this evening" : "today"}?`}
              className={`w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 ${
                newLineCount < maxLines ? "cursor-transparent" : ""
              }`}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              rows={8}
              onPaste={handlePaste}
            />
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          {/* Image Previews on the Left with Horizontal Scrolling */}
          <div className="flex items-center space-x-2 overflow-x-auto max-w-[400px] [&::-webkit-scrollbar]:w-2[&::-webkit-scrollbar]:h-2[&::-webkit-scrollbar-track]:bg-gray-100[&::-webkit-scrollbar-thumb]:bg-gray-300dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
            {imagePreviews.map((preview, index) => (
              <Drawer key={preview.url}>
                <DrawerTrigger asChild>
                  <div className="relative flex-shrink-0 cursor-pointer">
                    {preview.url ? (
                      <div className="flex flex-col items-center">
                        <Image
                          src={preview.url}
                          alt={`Uploaded preview ${index}`}
                          width={48}
                          height={48}
                          className="w-[2rem] h-[2rem] object-cover"
                          onClick={() => handleImageSelect(index)}
                        />
                      </div>
                    ) : (
                      <div className="w-[2rem] h-[2rem] bg-gray-200 flex items-center justify-center">
                        <Images className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
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
                  <div className="p-4 flex flex-col items-center">
                    {selectedImageIndex !== null &&
                      selectedImageIndex >= 0 &&
                      selectedImageIndex < imagePreviews.length && (
                        <>
                          <div className="mb-4">
                            <Image
                              src={imagePreviews[selectedImageIndex].url}
                              alt="Preview in drawer"
                              width={600}
                              height={400}
                              className="w-auto h-auto max-w-full max-h-[50vh] object-contain rounded-lg"
                            />
                          </div>
                          <div className="w-full max-w-[350px] space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">File name:</span>
                              <span>{imagePreviews[selectedImageIndex].name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">File size:</span>
                              <span>
                                {imagePreviews[selectedImageIndex].size > 1024 * 1024
                                  ? `${(imagePreviews[selectedImageIndex].size / (1024 * 1024)).toFixed(1)} MB`
                                  : `${(imagePreviews[selectedImageIndex].size / 1024).toFixed(1)} KB`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">File type:</span>
                              <span>{imagePreviews[selectedImageIndex].type.split('/')[1]?.toUpperCase()}</span>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </DrawerContent>
              </Drawer>
            ))}
          </div>

          {/* Action Buttons on the Right */}
          <div className="flex space-x-2">
            <ToolsDropdown />

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
                  className="relative flex-shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
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
                <p>Upload Image</p>
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
                  disabled={!(inputValue.trim() || transcript.trim())}
                  className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  onClick={() => {
                    handleSearch(inputValue, transcript, images)
                    reset()
                  }}
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
      <HashtagDropdown
        textareaRef={textareaRef}
        onSelectTool={handleHashtagToolSelect}
      />
    </div>
  )
}