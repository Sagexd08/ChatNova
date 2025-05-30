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
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("newChat")}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto p-4 rounded-xl transition-all duration-200 hover:scale-[1.02]",
                currentConversation === conversation.id
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/50 dark:to-purple-950/50 shadow-md border border-blue-200/50 dark:border-blue-800/50"
                  : "hover:bg-white/50 dark:hover:bg-gray-800/50",
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <div
                  className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    currentConversation === conversation.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm">{conversation.title}</div>
                  <div className="text-xs text-muted-foreground truncate mt-1">{conversation.lastMessage}</div>
                  <div className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Button>
          ))}

          {conversations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium">{t("noConversations")}</p>
              <p className="text-xs mt-1 opacity-60">Start your first conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
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
