"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Plus, MessageSquare } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: number
}

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversations: Conversation[]
  currentConversation: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export function Sidebar({
  open,
  onOpenChange,
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
}: SidebarProps) {
  const { t } = useLanguage()

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-white/20">
      {/* Enhanced header with new chat button */}
      <div className="p-3 sm:p-4 border-b border-white/10">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-10 sm:h-11 text-sm sm:text-base"
        >
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {t("newChat")}
        </Button>
      </div>

      {/* Conversations list with enhanced scrolling */}
      <ScrollArea className="flex-1">
        <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto p-3 sm:p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] group",
                currentConversation === conversation.id
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 shadow-md border border-blue-200/50 dark:border-blue-800/50"
                  : "hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-sm",
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start gap-2.5 sm:gap-3 w-full">
                <div
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg flex-shrink-0 transition-all duration-200",
                    currentConversation === conversation.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700",
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-xs sm:text-sm leading-tight">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5 sm:mt-1 leading-tight">
                    {conversation.lastMessage}
                  </div>
                  <div className="text-xs text-muted-foreground/60 mt-0.5 sm:mt-1">
                    {new Date(conversation.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: new Date(conversation.timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </div>
                </div>
              </div>
            </Button>
          ))}

          {/* Enhanced empty state */}
          {conversations.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-muted-foreground px-2">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full p-3 sm:p-4 w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs sm:text-sm font-medium">{t("noConversations")}</p>
              <p className="text-xs mt-1 opacity-60 leading-relaxed">Start your first conversation!</p>
              
              {/* Quick start tips */}
              <div className="mt-4 sm:mt-6 space-y-2">
                <div className="text-xs text-muted-foreground/80 space-y-1">
                  <p className="flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Upload documents
                  </p>
                  <p className="flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Ask questions
                  </p>
                  <p className="flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                    Get AI insights
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Enhanced footer with status */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="hidden sm:inline">Connected</span>
            <span className="sm:hidden">Online</span>
          </div>
          <div className="text-xs opacity-60">
            {conversations.length} chat{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64 bg-transparent border-none">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
