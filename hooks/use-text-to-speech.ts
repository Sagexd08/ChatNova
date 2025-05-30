"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/components/language-provider"

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const { language } = useLanguage()

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const getVoiceForLanguage = useCallback(
    (lang: string) => {
      const langMap: { [key: string]: string[] } = {
        en: ["en-US", "en-GB", "en"],
        hi: ["hi-IN", "hi"],
        bn: ["bn-IN", "bn-BD", "bn"],
      }

      const preferredLangs = langMap[lang] || ["en-US", "en"]

      for (const preferredLang of preferredLangs) {
        const voice = voices.find((v) => v.lang.startsWith(preferredLang))
        if (voice) return voice
      }

      return voices.find((v) => v.lang.startsWith("en")) || voices[0]
    },
    [voices],
  )

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text.trim()) return

      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = getVoiceForLanguage(language)

      if (voice) {
        utterance.voice = voice
      }

      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthesis.speak(utterance)
    },
    [isSupported, language, getVoiceForLanguage],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  }
}
