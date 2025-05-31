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
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 shadow-lg">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 mr-2 sm:mr-3"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        {/* Logo and branding */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="absolute inset-0 h-6 w-6 sm:h-8 sm:w-8 bg-blue-600/20 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
              ChatNova
            </h1>
          </div>
          
          {/* Subtitle - hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="hidden lg:block text-xs sm:text-sm text-muted-foreground/80 font-medium">
              AI-Powered Assistant
            </div>
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 dark:text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Globe className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  🇺🇸 English {language === "en" && <span className="text-blue-600">✓</span>}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("hi")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  🇮🇳 हिंदी {language === "hi" && <span className="text-blue-600">✓</span>}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("bn")}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  🇧🇩 বাংলা {language === "bn" && <span className="text-blue-600">✓</span>}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-white/20 dark:hover:bg-gray-800/50 transition-all duration-200 hover:scale-105 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Sun className="h-3.5 w-3.5 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  )
}
