"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MessageBubble } from "@/components/message-bubble"
import { FileUpload } from "@/components/file-upload"
import { VoiceInput } from "@/components/voice-input"
import { UploadedFiles } from "@/components/uploaded-files"
import { Send, Paperclip, Sparkles, ChevronDown, Bot, Zap } from "lucide-react"
import { useState } from "react"
import type { Message } from "@ai-sdk/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FullScreenChatInterfaceProps {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: Error | undefined
  uploadedFiles: Array<{ name: string; content: string; type: string }>
  onFileUpload: (files: Array<{ name: string; content: string; type: string }>) => void
  onRemoveFile: (index: number) => void
  selectedModel: 'grok' | 'gemini'
  onModelChange: (model: 'grok' | 'gemini') => void
}

export function FullScreenChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  selectedModel,
  onModelChange,
}: FullScreenChatInterfaceProps) {
  const [showFileUpload, setShowFileUpload] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle scroll events to detect when user has scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100
      
      setAutoScroll(!isScrolledUp)
      setShowScrollButton(isScrolledUp)
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    try {
      scrollToBottom()
    } catch (error) {
      // Silently handle any errors that might be related to extensions
      if (!(error instanceof Error) || (!error.message.includes("extension") && !error.message.includes("MetaMask"))) {
        console.error("Scroll error:", error)
      }
    }
  }, [messages, autoScroll])

  // Handle file upload and automatically hide the upload popup
  const handleFileUploadComplete = (files: Array<{ name: string; content: string; type: string }>) => {
    onFileUpload(files)
    setShowFileUpload(false) // Hide the upload popup after successful upload
  }

  return (
    <div className="flex-1 flex flex-col h-full relative z-10">
      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <UploadedFiles files={uploadedFiles} onRemoveFile={onRemoveFile} />
        </div>
      )}

      {/* Messages Container - FIXED SCROLLING */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="max-w-3xl w-full mx-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-2xl transform transition-all duration-500 hover:scale-[1.02]">
                <div className="p-8 text-center space-y-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:rotate-3">
                    <Sparkles className="w-12 h-12 text-white animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ✨ Hello! I'm your AI assistant powered by {selectedModel === 'grok' ? 'Grok' : 'Gemini'}.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                      I can help answer questions, have conversations, and analyze PDF documents you upload. How can I
                      assist you today?
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                    <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-lg">💬 Ask Questions</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Get detailed answers on any topic</p>
                    </div>
                    <div className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                      <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 text-lg">📄 Analyze PDFs</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Upload documents for insights</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <MessageBubble
              message={{
                id: "loading",
                role: "assistant",
                content: "",
                createdAt: new Date(),
              }}
              isLoading={true}
            />
          )}

          {error && (
            <div className="text-center text-red-500 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 max-w-2xl mx-auto">
              <p className="font-medium">Oops! Something went wrong.</p>
              <p className="text-sm mt-1">Please try again in a moment.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button 
            onClick={() => {
              setAutoScroll(true)
              scrollToBottom()
            }}
            className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 animate-bounce-slow z-10"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* File Upload Section */}
      {showFileUpload && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm animate-slide-down">
          <div className="max-w-3xl mx-auto">
            <FileUpload onFileUpload={handleFileUploadComplete} />
          </div>
        </div>
      )}

      {/* Enhanced Input Section */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Model Selector */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Model:</span>
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grok">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    Grok
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Gemini
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask ChatNova anything..."
                disabled={isLoading}
                className="pr-24 h-14 text-base bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 shadow-lg transition-all duration-200 rounded-xl"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <VoiceInput
                  onTranscript={(transcript) => {
                    const event = {
                      target: { value: transcript },
                    } as React.ChangeEvent<HTMLInputElement>
                    handleInputChange(event)
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="h-9 w-9 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Powered by {selectedModel === 'grok' ? 'Grok by xAI • Witty and intelligent responses' : 'Google Gemini • Advanced reasoning and intelligent analysis'}
          </p>
        </div>
      </div>
    </div>
  )
}
