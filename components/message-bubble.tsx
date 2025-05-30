"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Volume2, VolumeX, ThumbsUp, ThumbsDown, MoreVertical, User, Bot, Zap, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@ai-sdk/react"

interface MessageBubbleProps {
  message: Message
  isLoading?: boolean
}

export function MessageBubble({ message, isLoading = false }: MessageBubbleProps) {
  const [isCopied, setIsCopied] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)

  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)
  }

  const handleDislike = () => {
    setIsDisliked(!isDisliked)
    if (isLiked) setIsLiked(false)
  }

  return (
    <div className={cn("flex gap-4 group", isUser ? "justify-end" : "justify-start")}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn("flex flex-col max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        {/* Message Header */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isUser ? (
            <>
              <span>You</span>
              <User className="w-3 h-3" />
            </>
          ) : (
            <>
              <Bot className="w-3 h-3" />
              <span>ChatNova</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                AI
              </Badge>
            </>
          )}
        </div>

        {/* Message Bubble */}
        <Card
          className={cn(
            "relative p-4 shadow-lg transition-all duration-300 hover:shadow-xl",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-0"
              : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700",
            isLoading && "animate-pulse"
          )}
        >
          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
            </div>
          ) : (
            <>
              {/* Message Text */}
              <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "dark:prose-invert")}>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>

              {/* Message Actions */}
              {!isUser && (
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopy}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {isCopied ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied!" : "Copy message"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSpeak}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3 text-red-500" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isSpeaking ? "Stop speaking" : "Read aloud"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLike}
                          className={cn(
                            "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg",
                            isLiked && "text-green-500 bg-green-50 dark:bg-green-900/20"
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Like response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDislike}
                          className={cn(
                            "h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg",
                            isDisliked && "text-red-500 bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dislike response</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </>
          )}

          {/* Gradient overlay for user messages */}
          {isUser && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg pointer-events-none"></div>
          )}
        </Card>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : "Now"}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}
