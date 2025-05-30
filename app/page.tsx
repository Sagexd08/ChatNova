"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { FullScreenChatInterface } from "@/components/full-screen-chat-interface"
import { ChatSidebar } from "@/components/chat-sidebar"
import { WelcomeScreen } from "@/components/welcome-screen"
import { ParallaxBackground } from "@/components/parallax-background"

export default function ChatbotPage() {
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      name: string
      content: string
      type: string
    }>
  >([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string
      title: string
      timestamp: Date
      messages: any[]
    }>
  >([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<'grok' | 'gemini'>('grok')

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

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/chat",
    body: {
      uploadedFiles,
      selectedModel,
    },
    onResponse: () => {
      if (!hasStartedChat) {
        setHasStartedChat(true)
      }
    },
    onFinish: (message) => {
      // Save chat to history when conversation progresses
      if (messages.length > 0) {
        saveChatToHistory()
      }
    },
    onError: (error) => {
      // Only log non-extension related errors
      const extensionKeywords = ["MetaMask", "ChromeTransport", "extension", "wallet", "web3"]
      const isExtensionError = extensionKeywords.some((keyword) =>
        error.message.toLowerCase().includes(keyword.toLowerCase()),
      )

      if (!isExtensionError) {
        console.error("Chat error:", error)
      }
    },
  })

  const handleFileUpload = (files: Array<{ name: string; content: string; type: string }>) => {
    setUploadedFiles((prev) => [...prev, ...files])
    if (!hasStartedChat) {
      setHasStartedChat(true)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const saveChatToHistory = () => {
    if (messages.length === 0) return

    const chatId = currentChatId || Date.now().toString()
    const title = messages[0]?.content.slice(0, 50) + "..." || "New Chat"

    setChatHistory((prev) => {
      const existingIndex = prev.findIndex((chat) => chat.id === chatId)
      const chatData = {
        id: chatId,
        title,
        timestamp: new Date(),
        messages: [...messages],
      }

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = chatData
        return updated
      } else {
        return [chatData, ...prev]
      }
    })

    if (!currentChatId) {
      setCurrentChatId(chatId)
    }
  }

  const loadChatFromHistory = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId)
    if (chat) {
      setMessages(chat.messages)
      setCurrentChatId(chatId)
      setHasStartedChat(true)
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setUploadedFiles([])
    setHasStartedChat(false)
  }

  const deleteChatFromHistory = (chatId: string) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId))
    if (currentChatId === chatId) {
      startNewChat()
    }
  }

  const handleStartChat = () => {
    setHasStartedChat(true)
  }

  // Show welcome screen if no chat has started and no messages
  if (!hasStartedChat && messages.length === 0) {
    return (
      <div className="h-screen overflow-hidden perspective-1000">
        {/* 3D Parallax Background */}
        <ParallaxBackground mousePosition={mousePosition} scrollPosition={scrollPosition} />

        <div className="relative z-10 h-full flex flex-col overflow-auto">
          {/* Welcome Screen with Scrolling */}
          <div className="p-6 flex-1 overflow-auto">
            <WelcomeScreen onFileUpload={handleFileUpload} onStartChat={handleStartChat} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden perspective-1000">
      {/* 3D Parallax Background */}
      <ParallaxBackground mousePosition={mousePosition} scrollPosition={scrollPosition} />

      {/* Sidebar */}
      <ChatSidebar
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onLoadChat={loadChatFromHistory}
        onNewChat={startNewChat}
        onDeleteChat={deleteChatFromHistory}
      />

      {/* Main Chat Interface */}
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
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />
    </div>
  )
}
