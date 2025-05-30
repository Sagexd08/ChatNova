"use client"

import { useState, useEffect, useCallback } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: number
  messages: Message[]
}

export function useChatHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("chatnova-conversations")
    if (saved) {
      const parsed = JSON.parse(saved)
      setConversations(parsed)
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0].id)
      }
    } else {
      // Create initial conversation
      const initialConv: Conversation = {
        id: Date.now().toString(),
        title: "New Chat",
        lastMessage: "",
        timestamp: Date.now(),
        messages: [],
      }
      setConversations([initialConv])
      setCurrentConversation(initialConv.id)
    }
  }, [])

  const saveConversations = useCallback((convs: Conversation[]) => {
    localStorage.setItem("chatnova-conversations", JSON.stringify(convs))
    setConversations(convs)
  }, [])

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "",
      timestamp: Date.now(),
      messages: [],
    }

    const updated = [newConv, ...conversations]
    saveConversations(updated)
    setCurrentConversation(newConv.id)
  }, [conversations, saveConversations])

  const selectConversation = useCallback((id: string) => {
    setCurrentConversation(id)
  }, [])

  const saveMessage = useCallback(
    (conversationId: string, message: Message) => {
      const updated = conversations.map((conv) => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, message]
          return {
            ...conv,
            messages: updatedMessages,
            lastMessage: message.content.slice(0, 50) + (message.content.length > 50 ? "..." : ""),
            timestamp: Date.now(),
            title:
              conv.title === "New Chat" && message.role === "user"
                ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
                : conv.title,
          }
        }
        return conv
      })

      saveConversations(updated)
    },
    [conversations, saveConversations],
  )

  const getConversationMessages = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId)
      return conv?.messages || []
    },
    [conversations],
  )

  return {
    conversations,
    currentConversation,
    createNewConversation,
    selectConversation,
    saveMessage,
    getConversationMessages,
  }
}
