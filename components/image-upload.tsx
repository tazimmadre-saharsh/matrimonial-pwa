"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { blobStorage } from "@/lib/blob-storage"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
  useBlob?: boolean
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  label = "Upload images",
  useBlob = true
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [displayUrls, setDisplayUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const updateDisplayUrls = async () => {
      if (!images.length) {
        setDisplayUrls([])
        return
      }

      if (useBlob) {
        const urls: string[] = []
        for (const imageId of images) {
          if (imageId.startsWith('data:')) {
            urls.push(imageId)
          } else {
            const url = await blobStorage.getImageUrl(imageId)
            if (url) {
              urls.push(url)
            }
          }
        }
        setDisplayUrls(urls)
      } else {
        setDisplayUrls(images)
      }
    }

    updateDisplayUrls()
  }, [images, useBlob])

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || isUploading) return

    setIsUploading(true)
    const remainingSlots = maxImages - images.length
    const filesToProcess = Array.from(files)
      .slice(0, remainingSlots)
      .filter(file => file.type.startsWith("image/"))

    try {
      if (useBlob) {
        const newImageIds: string[] = []

        for (const file of filesToProcess) {
          const imageId = await blobStorage.storeImage(file)
          newImageIds.push(imageId)
        }

        onImagesChange([...images, ...newImageIds])
      } else {
        const newImages: string[] = []

        const processFile = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              if (e.target?.result) {
                resolve(e.target.result as string)
              } else {
                reject(new Error('Failed to read file'))
              }
            }
            reader.onerror = () => reject(new Error('File reading error'))
            reader.readAsDataURL(file)
          })
        }

        for (const file of filesToProcess) {
          try {
            const base64 = await processFile(file)
            newImages.push(base64)
          } catch (error) {
            console.error('Error processing file:', error)
          }
        }

        onImagesChange([...images, ...newImages])
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    if (useBlob && !imageToRemove.startsWith('data:')) {
      try {
        await blobStorage.deleteImage(imageToRemove)
      } catch (error) {
        console.error('Error deleting image from blob storage:', error)
      }
    }

    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isUploading}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          {isUploading ? "Uploading..." : label}
        </p>
        <p className="text-xs text-muted-foreground">
          {images.length}/{maxImages} images uploaded
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={isUploading}
        >
          {isUploading ? "Processing..." : "Select Files"}
        </Button>
      </Card>

      {displayUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayUrls.map((imageUrl, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                  disabled={isUploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
