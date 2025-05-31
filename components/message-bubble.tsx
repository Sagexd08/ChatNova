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
  const [isExpanded, setIsExpanded] = useState(true)
  const [showActions, setShowActions] = useState(false)

  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const messageLength = message.content.length

  // Determine if message is long and should have a collapse option
  const isLongMessage = messageLength > 500

  // Handle copy to clipboard with visual feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Enhanced text-to-speech with better voice selection
  const handleSpeak = () => {
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content)
      
      // Try to find a good voice
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Premium'))
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      // Adjust speech parameters for better quality
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  // Enhanced feedback functions with haptic feedback on mobile
  const handleLike = () => {
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const handleDislike = () => {
    setIsDisliked(!isDisliked)
    if (isLiked) setIsLiked(false)
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30])
    }
  }

  // Toggle message expansion for long messages
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      className={cn(
        "flex gap-2 sm:gap-4 group animate-fade-in-scale", 
        isUser ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={() => setShowActions(true)}
    >
      {/* AI Avatar - Responsive sizing */}
      {!isUser && (
        <div className="flex-shrink-0 hidden xs:block">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      )}

      {/* Message Content - Improved responsive layout */}
      <div className={cn(
        "flex flex-col space-y-1 sm:space-y-2", 
        isUser ? "items-end" : "items-start",
        isUser ? "max-w-[85%] sm:max-w-[75%]" : "max-w-[90%] sm:max-w-[80%]"
      )}>
        {/* Message Header - More compact on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isUser ? (
            <>
              <span className="text-[10px] sm:text-xs">You</span>
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </>
          ) : (
            <>
              <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-[10px] sm:text-xs">ChatNova</span>
              <Badge variant="secondary" className="text-[8px] sm:text-xs px-1 py-0 sm:px-1.5 sm:py-0 h-3.5 sm:h-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                AI
              </Badge>
            </>
          )}
          
          {/* Timestamp - Inline on mobile */}
          <span className="text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 ml-1.5">
            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Now"}
          </span>
        </div>

        {/* Message Bubble - Enhanced with glass morphism and responsive padding */}
        <Card
          className={cn(
            "relative p-3 sm:p-4 shadow-lg transition-all duration-300 hover:shadow-xl rounded-2xl",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-0"
              : "glass-card bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50",
            isLoading && "animate-pulse"
          )}
        >
          {/* Loading indicator - Enhanced animation */}
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="relative w-5 h-5">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500 absolute" />
                <div className="w-5 h-5 rounded-full border-2 border-blue-200 dark:border-blue-800 border-t-transparent dark:border-t-transparent animate-spin absolute"></div>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full typing-dot"></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
            </div>
          ) : (
            <>
              {/* Message Text - With collapsible content for long messages */}
              <div className={cn(
                "prose prose-sm max-w-none", 
                isUser ? "prose-invert" : "dark:prose-invert",
                !isExpanded && isLongMessage && "max-h-40 overflow-hidden relative"
              )}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                
                {/* Fade effect for collapsed messages */}
                {!isExpanded && isLongMessage && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
                )}
              </div>
              
              {/* Show more/less button for long messages */}
              {isLongMessage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleExpansion}
                  className="mt-2 h-6 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-0"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}

              {/* Enhanced Message Actions - Responsive and with better hover states */}
              {!isUser && (
                <div className={cn(
                  "flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 transition-all duration-200",
                  showActions ? "opacity-100" : "opacity-0 sm:group-hover:opacity-100"
                )}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopy}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        >
                          {isCopied ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
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
                          className={cn(
                            "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200",
                            isSpeaking && "bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3 text-red-500" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
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
                            "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200",
                            isLiked && "text-green-500 bg-green-50 dark:bg-green-900/20"
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {isLiked && <span className="sr-only">Liked</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{isLiked ? "Remove like" : "Like response"}</p>
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
                            "h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200",
                            isDisliked && "text-red-500 bg-red-50 dark:bg-red-900/20"
                          )}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          {isDisliked && <span className="sr-only">Disliked</span>}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        <p>{isDisliked ? "Remove dislike" : "Dislike response"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </>
          )}

          {/* Enhanced gradient overlay for user messages */}
          {isUser && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </>
          )}
        </Card>
      </div>

      {/* User Avatar - Responsive sizing */}
      {isUser && (
        <div className="flex-shrink-0 hidden xs:block">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className="absolute inset-0 bg-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      )}
    </div>
  )
}
