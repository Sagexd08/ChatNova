"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FileText, ImageIcon, Upload, X, CheckCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  content: string
  url?: string
}

interface DocumentUploadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFilesUploaded: (files: UploadedFile[]) => void
}

export function DocumentUpload({ open, onOpenChange, onFilesUploaded }: DocumentUploadProps) {
  const { t } = useLanguage()
  const [files, setFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)

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
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const processed: UploadedFile[] = []

    for (const file of files) {
      try {
        let content = ""

        if (file.type.startsWith("image/")) {
          content = `Image file: ${file.name} (${file.type})`
          const url = URL.createObjectURL(file)

          processed.push({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            content,
            url,
          })
        } else if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv") {
          content = await file.text()

          processed.push({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          })
        } else if (file.type === "application/json") {
          const jsonContent = await file.text()
          content = `JSON file content:\n${jsonContent}`

          processed.push({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          })
        } else if (
          file.type === "application/pdf" || 
          file.type === "application/msword" || 
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "text/plain"
        ) {
          // Process document files using server-side API
          const formData = new FormData()
          formData.append('file', file)

          try {
            const response = await fetch('/api/upload-pdf', {
              method: 'POST',
              body: formData,
              headers: {
                // Don't set Content-Type here as it's automatically set with the correct boundary for FormData
              },
            })

            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
              let fileTypeLabel = "Document"
              if (file.type === "application/pdf") fileTypeLabel = "PDF Document"
              else if (file.type.includes("word")) fileTypeLabel = "Word Document"
              else if (file.type === "text/plain") fileTypeLabel = "Text Document"

              content = `${fileTypeLabel}: ${file.name}\n\nExtracted Content:\n${result.content}`

              processed.push({
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                content,
              })
            } else {
              content = `Document: ${file.name}\nError: ${result.error || 'Failed to process document'}`

              processed.push({
                id: Date.now().toString() + Math.random(),
                name: file.name,
                type: file.type,
                size: file.size,
                content,
              })
            }
          } catch (docError) {
            console.error('Document processing error:', docError)
            content = `Document: ${file.name}\nError: Failed to process document file`

            processed.push({
              id: Date.now().toString() + Math.random(),
              name: file.name,
              type: file.type,
              size: file.size,
              content,
            })
          }
        } else {
          content = `Document file: ${file.name} (${file.type}) - This file type is not yet supported for content extraction.`

          processed.push({
            id: Date.now().toString() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          })
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)

        // Add file with error message
        processed.push({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: `Error processing file: ${file.name}`,
        })
      }
    }

    setProcessedFiles(processed)
    setIsProcessing(false)
  }

  const handleUpload = () => {
    onFilesUploaded(processedFiles)
    setFiles([])
    setProcessedFiles([])
    onOpenChange(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("uploadDocuments")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10",
            )}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.md,.csv,.json"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">{t("dropFilesHere")}</p>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{t("dragDropFiles")}</p>
                  <p className="text-sm text-gray-500">{t("supportedFormats")}</p>
                </div>
              )}
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("selectedFiles")}</h3>
              {files.map((file, index) => (
                <Card key={index} className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Processed Files */}
          {processedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-green-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t("processedFiles")}
              </h3>
              {processedFiles.map((file) => (
                <Card
                  key={file.id}
                  className="p-3 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-3">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm text-green-800 dark:text-green-200">{file.name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{t("readyToUse")}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {files.length > 0 && processedFiles.length === 0 && (
              <Button
                onClick={processFiles}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isProcessing ? t("processing") : t("processFiles")}
              </Button>
            )}

            {processedFiles.length > 0 && (
              <Button
                onClick={handleUpload}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                {t("addToChat")}
              </Button>
            )}

            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
