"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Image, X, Download, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  name: string
  content: string
  type: string
  url?: string
}

interface UploadedFilesProps {
  files: UploadedFile[]
  onRemoveFile: (index: number) => void
}

export function UploadedFiles({ files, onRemoveFile }: UploadedFilesProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />
    }
    return <FileText className="w-4 h-4 text-purple-500" />
  }

  const getFileTypeColor = (type: string) => {
    if (type === 'application/pdf') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    if (type.startsWith('image/')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    if (type.startsWith('text/')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  }

  const formatFileSize = (content: string) => {
    const bytes = new Blob([content]).size
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Uploaded Files ({files.length})
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((file, index) => (
          <Card
            key={index}
            className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="space-y-3">
              {/* File Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file.type)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getFileTypeColor(file.type))}
                      >
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.content)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(index)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* File Preview */}
              {file.url && file.type.startsWith('image/') ? (
                <div className="relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 rounded-lg"></div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {truncateContent(file.content)}
                  </p>
                </div>
              )}

              {/* File Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        onClick={() => {
                          // Create a modal or expand view for full content
                          const newWindow = window.open('', '_blank')
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>${file.name}</title></head>
                                <body style="font-family: monospace; padding: 20px; white-space: pre-wrap;">
                                  ${file.content}
                                </body>
                              </html>
                            `)
                          }
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View full content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs hover:bg-green-100 dark:hover:bg-green-900/30"
                        onClick={() => {
                          const blob = new Blob([file.content], { type: file.type })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = file.name
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
