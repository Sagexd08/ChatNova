"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Paperclip,
  FileText,
  ImageIcon,
  X,
  Download,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useChatHistory } from "@/hooks/use-chat-history"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { DocumentUpload } from "@/components/document-upload"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  conversationId: string | null
}

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  content: string
  url?: string
}

export function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { t } = useLanguage()
  const { saveMessage, getConversationMessages } = useChatHistory()
  const [initialMessages, setInitialMessages] = useState<any[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages,
    body: {
      files: uploadedFiles,
    },
    onFinish: (message) => {
      if (conversationId) {
        saveMessage(conversationId, message)
      }
    },
  })

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput()
  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech()

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId) {
      const savedMessages = getConversationMessages(conversationId)
      setInitialMessages(savedMessages)
    }
  }, [conversationId, getConversationMessages])

  useEffect(() => {
    if (transcript) {
      handleInputChange({ target: { value: transcript } } as any)
    }
  }, [transcript, handleInputChange])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && uploadedFiles.length === 0) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      files: uploadedFiles,
    }

    if (conversationId) {
      saveMessage(conversationId, userMessage)
    }

    handleSubmit(e)
    setUploadedFiles([])
  }

  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
    setShowDocumentUpload(false)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text)
    }
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <ScrollArea className="flex-1 p-6 relative z-10" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-2xl animate-pulse">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 mx-auto animate-ping opacity-20"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("welcome")}
              </h3>
              <p className="text-muted-foreground text-lg">{t("startConversation")}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 transform hover:scale-105 transition-transform">
                  🤖 AI Assistant
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 transform hover:scale-105 transition-transform">
                  🎤 Voice Input
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 transform hover:scale-105 transition-transform">
                  🔊 Text-to-Speech
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 transform hover:scale-105 transition-transform">
                  📄 Document Upload
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-white/20 transform hover:scale-105 transition-transform">
                  🌍 Multilingual
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.role === "assistant" && (
                <Avatar className="h-10 w-10 shadow-lg border-2 border-white/20">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="max-w-[85%] space-y-2">
                {/* Files attached to message */}
                {message.files && message.files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.files.map((file: UploadedFile) => (
                      <div
                        key={file.id}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 flex items-center gap-2 text-xs"
                      >
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        {file.url && (
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0" asChild>
                            <a href={file.url} download={file.name}>
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Card
                  className={cn(
                    "p-4 shadow-lg border-0 transition-all duration-200 hover:shadow-xl transform hover:scale-[1.02]",
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20",
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs opacity-60">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {message.role === "assistant" && ttsSupported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:scale-110"
                        onClick={() => handleSpeak(message.content)}
                      >
                        {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {message.role === "user" && (
                <Avatar className="h-10 w-10 shadow-lg border-2 border-white/20">
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start animate-in slide-in-from-bottom-2">
              <Avatar className="h-10 w-10 shadow-lg border-2 border-white/20">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 p-4 shadow-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-white/20 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl relative z-10">
        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 rounded-lg p-2 flex items-center gap-2 text-sm"
                >
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="h-4 w-4 text-green-500" />
                  )}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => removeFile(file.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-200 hover:scale-105"
              onClick={() => setShowDocumentUpload(true)}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder={uploadedFiles.length > 0 ? t("askAboutDocuments") : t("typeMessage")}
                disabled={isLoading}
                className="pr-14 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 shadow-lg"
              />
              {isSupported && (
                <Button
                  type="button"
                  size="sm"
                  variant={isListening ? "destructive" : "ghost"}
                  className={cn(
                    "absolute right-2 top-2 h-8 w-8 p-0 transition-all duration-200",
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                      : "hover:bg-blue-100 dark:hover:bg-blue-900/50",
                  )}
                  onClick={isListening ? stopListening : startListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
              className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Document Upload Modal */}
      <DocumentUpload
        open={showDocumentUpload}
        onOpenChange={setShowDocumentUpload}
        onFilesUploaded={handleFileUpload}
      />
    </div>
  )
}
