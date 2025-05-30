"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Message } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageBubble } from "@/components/message-bubble"
import { FileUpload } from "@/components/file-upload"
import { UploadedFiles } from "@/components/uploaded-files"
import { Send, Paperclip, Sparkles, ChevronDown, Bot, Zap, Mic, MicOff, FileText, Loader2, MessageSquare } from "lucide-react"

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
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set())
  const [typingProgress, setTypingProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

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
            <div className="flex items-center justify-center min-h-[60vh] relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
              </div>

              <Card className="max-w-4xl w-full mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20"></div>

                <div className="relative p-10 text-center space-y-10">
                  {/* Animated logo */}
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:rotate-6 hover:scale-110 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <Sparkles className="w-16 h-16 text-white animate-pulse relative z-10" />
                      <div className="absolute inset-0 animate-ping bg-white/20 rounded-3xl"></div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-bounce shadow-lg"></div>
                  </div>

                  {/* Enhanced title */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                        ChatNova
                      </h1>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1">
                          {selectedModel === 'grok' ? (
                            <><Bot className="w-3 h-3 mr-1" /> Powered by Grok</>
                          ) : (
                            <><Zap className="w-3 h-3 mr-1" /> Powered by Gemini</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto font-medium">
                      Your intelligent AI companion for conversations, document analysis, and creative problem-solving.
                      Experience the future of AI interaction with advanced reasoning and personality.
                    </p>
                  </div>

                  {/* Enhanced feature grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-2xl border border-blue-200 dark:border-blue-700/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                              <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-lg">Smart Conversations</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">Engage in natural, intelligent conversations with context awareness</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Advanced AI models for natural conversations</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-2xl border border-purple-200 dark:border-purple-700/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2 text-lg">Document Analysis</h3>
                            <p className="text-sm text-purple-600 dark:text-purple-400 leading-relaxed">Upload and analyze PDFs with intelligent content extraction</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Advanced PDF processing and analysis</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="group p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-2xl border border-green-200 dark:border-green-700/50 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300">
                              <Mic className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 text-lg">Voice Interaction</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 leading-relaxed">Speak naturally and hear responses with voice technology</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Voice input and text-to-speech capabilities</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Quick start suggestions */}
                  <div className="mt-10 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Try asking:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        "Explain quantum computing",
                        "Analyze my document",
                        "Write a creative story",
                        "Help with coding"
                      ].map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                          onClick={() => {
                            if (inputRef.current) {
                              inputRef.current.value = suggestion
                              inputRef.current.focus()
                            }
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
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

      {/* Enhanced Input Section with Advanced Styling */}
      <div className="relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80 backdrop-blur-2xl"></div>

        {/* Decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

        <div className="relative p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Model Selector with Enhanced Styling */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI Model:</span>
              </div>
              <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="w-40 h-10 text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 rounded-xl shadow-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl">
                  <SelectItem value="grok" className="hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">Grok</span>
                      <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">Witty</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">Gemini</span>
                      <Badge variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">Smart</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Input Form */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex gap-4">
                <div className="flex-1 relative group">
                  {/* Input field with enhanced styling */}
                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Ask ChatNova anything... ✨"
                      disabled={isLoading}
                      className="w-full h-16 px-6 pr-32 text-base bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium resize-none outline-none"
                      autoFocus
                    />

                    {/* Typing progress indicator */}
                    {isLoading && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-2xl overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                      </div>
                    )}

                    {/* Input actions */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsListening(!isListening)}
                              className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                                isListening
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                                  : 'hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isListening ? 'Stop listening' : 'Voice input'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFileUpload(!showFileUpload)}
                              className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 ${
                                showFileUpload
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                  : 'hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <Paperclip className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload documents</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Enhanced Send Button */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-16 w-16 p-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 rounded-2xl relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                          <Send className="w-6 h-6 text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isLoading ? 'Generating response...' : 'Send message'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </form>

            {/* Enhanced Footer with Status */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Powered by {selectedModel === 'grok' ? 'Grok by xAI' : 'Google Gemini'} •
                  {selectedModel === 'grok' ? ' Witty and intelligent responses' : ' Advanced reasoning and analysis'}
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{uploadedFiles.length} document{uploadedFiles.length > 1 ? 's' : ''} attached</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
