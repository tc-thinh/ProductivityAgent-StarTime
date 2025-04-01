"use client"

import { SearchEngine } from "@/components/search-engine/search-engine"
import { fetchBackendService, convertToBase64, combinePrompt } from "@/lib/utils"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"

export default function Landing() {
  const { accessToken } = useUserStore()

  // Handle search
    const handleSearch = async (promptText: string, voiceTranscript: string, images: File[]) => {
      if (!promptText.trim() && !voiceTranscript.trim()) return
  
      const queryText = combinePrompt({
        textPrompt: promptText.trim(),
        transcript: voiceTranscript
      })
  
      try {
        const imagesBase64: string[] = []
  
        for (let i = 0; i < images.length; i++) {
          const base64String = await convertToBase64(images[i]) as string
          imagesBase64.push(base64String)
        }
  
        const { success, data } = await fetchBackendService<{ conversationId: string }>(
          {
            endpoint: `ai/request/`,
            method: "POST",
            body: {
              "userPrompt": queryText,
              "token": accessToken || "",
              "images": imagesBase64
            }
          }
        )
        if (!success) toast.error("Something went wrong. Please try again later")
        else toast.success("The AI agents are doing their best to help you! Please wait.")
  
        window.location.href = `/${data?.conversationId}`
      } catch (error) {
        console.error("Failed to connect to the backend: ", error)
        toast.error("Failed to connect to an AI agent. Please try again later.")
      } finally {
      }
    }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {/* <Icon icon="chat" /> */}

          <h1>This is <span style={{ color: "#106ba3" }}>StarTime!</span></h1>
          <h5>Scheduling your day, so you can chase the Stars. 🌟✨</h5>
        </div>

        <SearchEngine handleSearch={handleSearch} />
      </div>
    </>
  )
}
