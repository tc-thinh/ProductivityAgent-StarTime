"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import  Image  from "next/image"


interface Tool {
  id: string
  name: string
  logo: string
}

const availableTools: Tool[] = [
  { id: 'google-calendar', name: 'Google Calendar', logo: '/logos/google-calendar.png' },
  { id: 'spotify', name: 'Spotify', logo: '/logos/spotify.png' },
  { id: 'youtube', name: 'YouTube', logo: '/logos/youtube.png' },
  { id: 'google-docs', name: 'Google Docs', logo: '/logos/google-docs.png' },
  { id: 'gmail', name: 'Gmail', logo: '/logos/gmail.png' },
  { id: 'google-maps', name: 'Google Maps', logo: '/logos/google-maps.png' },
  { id: 'google-drive', name: 'Google Drive', logo: '/logos/google-drive.png' },
]

const HashtagDropdown = ({
  textareaRef,
  onSelectTool,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSelectTool: (toolId: string) => void
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownSearch, setDropdownSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter tools based on search
  const filteredTools = availableTools.filter(tool =>
    tool.name.toLowerCase().includes(dropdownSearch.toLowerCase())
  )

  // Handle textarea changes to detect hashtags
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const value = textarea.value
      const cursorPos = textarea.selectionStart
      const textUpToCursor = value.slice(0, cursorPos)

      const lastHashtagIndex = textUpToCursor.lastIndexOf('#')
      const hasUnclosedHashtag = lastHashtagIndex >= 0 && 
                               !textUpToCursor.slice(lastHashtagIndex).includes(' ')

      if (hasUnclosedHashtag) {
        const span = document.createElement('span')
        span.textContent = textUpToCursor.slice(0, lastHashtagIndex)
        span.style.visibility = 'hidden'
        span.style.whiteSpace = 'pre-wrap'
        span.style.font = window.getComputedStyle(textarea).font
        document.body.appendChild(span)
        
        document.body.removeChild(span)

        setDropdownSearch(textUpToCursor.slice(lastHashtagIndex + 1).toLowerCase())
        setDropdownOpen(true)
        setSelectedIndex(0)
      } else {
        setDropdownOpen(false)
      }
    }

    textarea.addEventListener('input', handleInput)
    return () => textarea.removeEventListener('input', handleInput)
  }, [textareaRef])

  // Keyboard navigation
  useEffect(() => {
    if (!dropdownOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, filteredTools.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredTools[selectedIndex]) {
            onSelectTool(filteredTools[selectedIndex].id)
            setDropdownOpen(false)
          }
          break
        case 'Escape':
          e.preventDefault()
          setDropdownOpen(false)
          textareaRef.current?.focus()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dropdownOpen, filteredTools, selectedIndex, onSelectTool, textareaRef])

  

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05
      }
    })
  }

  return (
    <div className="p-1 w-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        {dropdownOpen && (
          filteredTools.length > 0 ? (
            <motion.ul
              key="has-tools"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {filteredTools.map((tool, index) => (
                <motion.li
                  key={tool.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-3 py-2 flex items-center gap-3 cursor-pointer rounded-md ${
                    index === selectedIndex 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    onSelectTool(tool.id)
                    setDropdownOpen(false)
                  }}
                >
                  <div className="relative h-5 w-5 flex-shrink-0">
                    <Image
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {tool.name}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key="no-tools"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
            >
              No tools found 
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  )
  
}
export default HashtagDropdown