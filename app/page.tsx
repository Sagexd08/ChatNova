"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: number
}

export default function ChatbotPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)
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
    setSidebarOpen(false)
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id)
    setSidebarOpen(false)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          conversations={conversations}
          currentConversation={currentConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        <main className="flex-1 md:ml-64">
          <ChatInterface />
        </main>
      </div>
    </div>
  )
}
