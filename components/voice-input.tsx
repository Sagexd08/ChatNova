"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  className?: string
  onCommand?: (command: string, args?: string) => void
}

// Define voice commands
const VOICE_COMMANDS = {
  UPLOAD: ['upload file', 'upload document', 'upload pdf', 'upload a file', 'upload a document'],
  CLEAR: ['clear chat', 'clear conversation', 'clear messages', 'start new chat'],
  HELP: ['show commands', 'voice commands', 'show help', 'what can i say'],
  SEND: ['send message', 'send', 'submit'],
}

export function VoiceInput({ onTranscript, onCommand, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [showCommandsDialog, setShowCommandsDialog] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        
        const recognition = recognitionRef.current
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim().toLowerCase()
            if (event.results[i].isFinal) {
              finalTranscript += transcript
              
              // Check for voice commands
              if (onCommand) {
                // Process commands
                const isCommand = processVoiceCommand(transcript)
                if (!isCommand) {
                  // If not a command, treat as regular transcript
                  onTranscript(transcript)
                }
              } else {
                // If no command handler provided, just pass the transcript
                onTranscript(transcript)
              }
            }
          }
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript, onCommand])
  
  // Process voice commands
  const processVoiceCommand = (transcript: string): boolean => {
    // Check for upload commands
    if (VOICE_COMMANDS.UPLOAD.some(cmd => transcript.includes(cmd))) {
      setLastCommand('Upload document')
      onCommand?.('upload')
      return true
    }
    
    // Check for clear commands
    if (VOICE_COMMANDS.CLEAR.some(cmd => transcript.includes(cmd))) {
      setLastCommand('Clear chat')
      onCommand?.('clear')
      return true
    }
    
    // Check for help commands
    if (VOICE_COMMANDS.HELP.some(cmd => transcript.includes(cmd))) {
      setLastCommand('Show commands')
      setShowCommandsDialog(true)
      return true
    }
    
    // Check for send commands
    if (VOICE_COMMANDS.SEND.some(cmd => transcript.includes(cmd))) {
      setLastCommand('Send message')
      onCommand?.('send')
      return true
    }
    
    return false
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={cn(
                  "h-9 w-9 p-0 rounded-full transition-all duration-200",
                  isListening
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 animate-pulse"
                    : "hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400",
                  className
                )}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
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
                onClick={() => setShowCommandsDialog(true)}
                className="h-9 w-9 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 dark:text-gray-400"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show voice commands</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Voice Commands Dialog */}
      <Dialog open={showCommandsDialog} onOpenChange={setShowCommandsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Voice Commands
            </DialogTitle>
            <DialogDescription>
              Say any of these commands while the microphone is active
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600 dark:text-blue-400">Upload Documents</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "{VOICE_COMMANDS.UPLOAD.join('", "')}"
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600 dark:text-blue-400">Clear Chat</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "{VOICE_COMMANDS.CLEAR.join('", "')}"
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600 dark:text-blue-400">Send Message</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "{VOICE_COMMANDS.SEND.join('", "')}"
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-blue-600 dark:text-blue-400">Show Commands</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                "{VOICE_COMMANDS.HELP.join('", "')}"
              </p>
            </div>
          </div>
          {lastCommand && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm font-medium">Last recognized command:</p>
              <p className="text-blue-600 dark:text-blue-400">{lastCommand}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
