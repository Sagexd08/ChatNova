"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/components/language-provider"

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const { language } = useLanguage()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false

        const langMap: { [key: string]: string } = {
          en: "en-US",
          hi: "hi-IN",
          bn: "bn-IN",
        }
        recognitionInstance.lang = langMap[language] || "en-US"

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[0][0].transcript
          setTranscript(result)
          setIsListening(false)
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error:", event)
          setIsListening(false)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [language])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript("")
      setIsListening(true)
      try {
        recognition.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
      }
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition, isListening])

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
  }
}
