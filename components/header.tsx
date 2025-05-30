"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Moon, Sun, Globe, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/components/language-provider"

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <header className="border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-lg">
      <div className="flex h-16 items-center px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center gap-3 ml-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-blue-600/20 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ChatNova
            </h1>
          </div>
          <div className="hidden sm:block text-sm text-muted-foreground/80 font-medium">AI-Powered Assistant</div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105"
              >
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20"
            >
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                🇺🇸 English {language === "en" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("hi")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                🇮🇳 हिंदी {language === "hi" && "✓"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("bn")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                🇧🇩 বাংলা {language === "bn" && "✓"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
