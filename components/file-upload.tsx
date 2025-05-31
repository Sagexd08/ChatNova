"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onFileUpload: (files: Array<{ name: string; content: string; type: string }>) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'pending' | 'uploading' | 'success' | 'error'>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/json', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    setFiles(prev => [...prev, ...validFiles])
    
    // Initialize status for new files
    const newStatus: Record<string, 'pending'> = {}
    validFiles.forEach(file => {
      newStatus[file.name] = 'pending'
    })
    setUploadStatus(prev => ({ ...prev, ...newStatus }))
  }

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
  }

  const processFiles = async () => {
    const processedFiles: Array<{ name: string; content: string; type: string }> = []

    for (const file of files) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
        
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: i }))
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        let content = ""

        if (file.type === 'application/pdf') {
          // Use the PDF processing API
          console.log('Processing PDF file:', file.name, 'Size:', file.size, 'Type:', file.type)

          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch('/api/upload-pdf', {
            method: 'POST',
            body: formData,
          })

          console.log('PDF API response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('PDF API error response:', errorText)
            throw new Error(`PDF processing failed: ${response.status} - ${errorText}`)
          }

          const result = await response.json()
          console.log('PDF processing result:', result)

          if (result.success) {
            content = result.content
          } else {
            throw new Error(result.error || 'Failed to process PDF')
          }
        } else if (file.type.startsWith('text/') || file.type === 'application/json') {
          content = await file.text()
        } else if (file.type.startsWith('image/')) {
          content = `Image file: ${file.name} (${file.type})`
        } else {
          content = `File: ${file.name} (${file.type})`
        }

        processedFiles.push({
          name: file.name,
          content,
          type: file.type,
        })

        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))

        // Show success toast for PDF files
        if (file.type === 'application/pdf') {
          toast({
            title: "PDF Processed Successfully",
            description: `${file.name} has been analyzed and is ready for AI interaction.`,
          })
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))

        // Show error toast
        toast({
          title: "File Processing Failed",
          description: error instanceof Error ? error.message : `Failed to process ${file.name}`,
          variant: "destructive",
        })
      }
    }

    if (processedFiles.length > 0) {
      onFileUpload(processedFiles)
      setFiles([])
      setUploadProgress({})
      setUploadStatus({})
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />
    if (type === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />
    return <FileText className="w-4 h-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
      <div className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
            isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-105"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.md,.csv,.json,application/pdf"
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">Drop files here!</p>
                <p className="text-sm text-blue-500 dark:text-blue-300">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Supports PDF, TXT, MD, CSV, JSON, and images (max 10MB each)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Selected Files</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    {uploadProgress[file.name] !== undefined && (
                      <Progress 
                        value={uploadProgress[file.name]} 
                        className="mt-2 h-1"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadStatus[file.name])}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {files.length > 0 && (
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={processFiles}
              disabled={Object.values(uploadStatus).some(status => status === 'uploading')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {Object.values(uploadStatus).some(status => status === 'uploading') ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setFiles([])
                setUploadProgress({})
                setUploadStatus({})
              }}
              className="px-6"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
