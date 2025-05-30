"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "hi" | "bn"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    welcome: "Welcome to ChatNova",
    startConversation: "Start a conversation with our AI assistant",
    typeMessage: "Type your message...",
    askAboutDocuments: "Ask about your uploaded documents...",
    newChat: "New Chat",
    noConversations: "No conversations yet",
    aiPoweredChatbot: "AI-Powered Multilingual Chatbot",
    aiConversations: "AI-powered conversations",
    voiceInput: "Voice-to-text input",
    multilingualSupport: "Multilingual support",
    uploadDocuments: "Upload Documents",
    dragDropFiles: "Drag & drop files here, or click to select",
    dropFilesHere: "Drop files here...",
    supportedFormats: "Supports: PDF, DOC, TXT, Images, MD, CSV, JSON (Max 10MB)",
    selectedFiles: "Selected Files",
    processedFiles: "Processed Files",
    readyToUse: "Ready to use",
    processing: "Processing...",
    processFiles: "Process Files",
    addToChat: "Add to Chat",
    cancel: "Cancel",
  },
  hi: {
    welcome: "ChatNova में आपका स्वागत है",
    startConversation: "हमारे AI असिस्टेंट के साथ बातचीत शुरू करें",
    typeMessage: "अपना संदेश टाइप करें...",
    askAboutDocuments: "अपने अपलोड किए गए दस्तावेजों के बारे में पूछें...",
    newChat: "नई चैट",
    noConversations: "अभी तक कोई बातचीत नहीं",
    aiPoweredChatbot: "AI-संचालित बहुभाषी चैटबॉट",
    aiConversations: "AI-संचालित बातचीत",
    voiceInput: "आवाज़ से टेक्स्ट इनपुट",
    multilingualSupport: "बहुभाषी समर्थन",
    uploadDocuments: "दस्तावेज़ अपलोड करें",
    dragDropFiles: "फ़ाइलें यहाँ खींचें और छोड़ें, या चुनने के लिए क्लिक करें",
    dropFilesHere: "फ़ाइलें यहाँ छोड़ें...",
    supportedFormats: "समर्थित: PDF, DOC, TXT, Images, MD, CSV, JSON (अधिकतम 10MB)",
    selectedFiles: "चयनित फ़ाइलें",
    processedFiles: "प्रोसेस की गई फ़ाइलें",
    readyToUse: "उपयोग के लिए तैयार",
    processing: "प्रोसेसिंग...",
    processFiles: "फ़ाइलें प्रोसेस करें",
    addToChat: "चैट में जोड़ें",
    cancel: "रद्द करें",
  },
  bn: {
    welcome: "ChatNova তে আপনাকে স্বাগতম",
    startConversation: "আমাদের AI সহায়কের সাথে কথোপকথন শুরু করুন",
    typeMessage: "আপনার বার্তা টাইপ করুন...",
    askAboutDocuments: "আপনার আপলোড করা নথি সম্পর্কে জিজ্ঞাসা করুন...",
    newChat: "নতুন চ্যাট",
    noConversations: "এখনও কোনো কথোপকথন নেই",
    aiPoweredChatbot: "AI-চালিত বহুভাষিক চ্যাটবট",
    aiConversations: "AI-চালিত কথোপকথন",
    voiceInput: "ভয়েস-টু-টেক্সট ইনপুট",
    multilingualSupport: "বহুভাষিক সহায়তা",
    uploadDocuments: "নথি আপলোড করুন",
    dragDropFiles: "ফাইল এখানে টেনে আনুন, বা নির্বাচন করতে ক্লিক করুন",
    dropFilesHere: "ফাইল এখানে ছেড়ে দিন...",
    supportedFormats: "সমর্থিত: PDF, DOC, TXT, Images, MD, CSV, JSON (সর্বোচ্চ 10MB)",
    selectedFiles: "নির্বাচিত ফাইল",
    processedFiles: "প্রক্রিয়াকৃত ফাইল",
    readyToUse: "ব্যবহারের জন্য প্রস্তুত",
    processing: "প্রক্রিয়াকরণ...",
    processFiles: "ফাইল প্রক্রিয়া করুন",
    addToChat: "চ্যাটে যোগ করুন",
    cancel: "বাতিল",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("chatnova-language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("chatnova-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[Language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
