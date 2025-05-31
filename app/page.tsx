"use client"

import { useState, useEffect } from "react"
import { FullScreenChatInterface } from "@/components/full-screen-chat-interface"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: number
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: Date
}

export default function ChatbotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; content: string; type: string }>>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    // Comprehensive extension error suppression
    const extensionKeywords = [
      "MetaMask",
      "ChromeTransport",
      "extension not found",
      "chrome-extension",
      "moz-extension",
      "safari-extension",
      "wallet",
      "web3",
      "ethereum",
      "crypto",
      "blockchain",
      "connectChrome",
      "extension",
      "addon",
    ]

    const shouldSuppress = (message: string) => {
      if (typeof message !== "string") return false
      return extensionKeywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))
    }

    // Override all console methods
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log
    const originalConsoleInfo = console.info

    console.error = (...args) => {
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return
      }
      originalConsoleError(...args)
    }

    console.warn = (...args) => {
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return
      }
      originalConsoleWarn(...args)
    }

    console.log = (...args) => {
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return
      }
      originalConsoleLog(...args)
    }

    console.info = (...args) => {
      if (args.length > 0 && shouldSuppress(String(args[0]))) {
        return
      }
      originalConsoleInfo(...args)
    }

    // Enhanced error event listener
    const handleError = (event: ErrorEvent) => {
      if (event.message && shouldSuppress(event.message)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return false
      }
    }

    // Enhanced unhandled rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && shouldSuppress(String(event.reason))) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    // Track mouse movement for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      try {
        setMousePosition({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        })
      } catch (error) {
        // Silently handle any errors
      }
    }

    // Track scroll position for parallax effect
    const handleScroll = () => {
      try {
        setScrollPosition(window.scrollY)
      } catch (error) {
        // Silently handle any errors
      }
    }

    // Add event listeners with capture phase
    window.addEventListener("error", handleError, true)
    window.addEventListener("unhandledrejection", handleRejection, true)
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Override fetch to block extension requests
    const originalFetch = window.fetch
    window.fetch = function (...args) {
      const url = String(args[0])
      if (extensionKeywords.some((keyword) => url.toLowerCase().includes(keyword.toLowerCase()))) {
        return Promise.reject(new Error("Extension request blocked"))
      }
      return originalFetch.apply(this, args)
    }

    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
      console.info = originalConsoleInfo
      window.removeEventListener("error", handleError, true)
      window.removeEventListener("unhandledrejection", handleRejection, true)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
      window.fetch = originalFetch
    }
  }, [])

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "Start a new conversation",
      timestamp: Date.now(),
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversation(newConversation.id)
    setMessages([])
    setSidebarOpen(false)
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id)
    setSidebarOpen(false)
    // In a real app, you'd load messages for this conversation
    setMessages([])
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          uploadedFiles,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        createdAt: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (files: Array<{ name: string; content: string; type: string }>) => {
    setUploadedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Enhanced Animated background elements with better responsiveness */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orb */}
        <div
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          }}
        />
        
        {/* Secondary gradient orb */}
        <div
          className="absolute top-3/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-gradient-to-r from-purple-400/15 via-pink-400/20 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
          }}
        />
        
        {/* Tertiary gradient orb */}
        <div
          className="absolute bottom-1/4 left-1/3 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-r from-pink-400/20 via-blue-400/15 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          }}
        />
        
        {/* Additional floating elements for depth */}
        <div
          className="absolute top-1/2 right-1/3 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-2xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 8}px)`,
          }}
        />
        
        <div
          className="absolute bottom-1/3 right-1/4 w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-float delay-1500"
          style={{
            transform: `translate(${mousePosition.x * -8}px, ${mousePosition.y * 12}px)`,
          }}
        />
      </div>

      {/* Responsive Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Enhanced Main Content with better responsive layout */}
      <div className="flex h-[calc(100vh-4rem)] relative z-10">
        {/* Responsive Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        {/* Enhanced Chat Interface with responsive margins */}
        <main className="flex-1 transition-all duration-300 ease-in-out md:ml-64 relative">
          <FullScreenChatInterface
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            selectedModel="gemini"
            onModelChange={() => {}} // No model change needed since we only have Gemini
          />
        </main>
      </div>
    </div>
  )
}
