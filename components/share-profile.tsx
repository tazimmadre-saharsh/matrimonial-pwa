"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Share2, Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"

interface ShareProfileProps {
  user: User
}

export function ShareProfile({ user }: ShareProfileProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateProfileImage = async () => {
    setIsGenerating(true)
    try {
      const element = document.getElementById("profile-card")
      if (!element) {
        throw new Error("Profile card not found")
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      })

      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
          },
          "image/png",
          0.9,
        )
      })

      return { canvas, imageBlob }
    } catch (error) {
      console.error("Error generating profile image:", error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    try {
      const { imageBlob } = await generateProfileImage()

      if (navigator.share && navigator.canShare) {
        const file = new File([imageBlob], `${user.fullName}_profile.png`, {
          type: "image/png",
        })

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${user.fullName} - Matrimonial Profile`,
            text: `Check out ${user.fullName}'s matrimonial profile`,
            files: [file],
          })
          return
        }
      }

      // Fallback to download
      handleDownload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share profile. Please try downloading instead.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    try {
      const { canvas } = await generateProfileImage()

      const link = document.createElement("a")
      link.download = `${user.fullName}_profile.png`
      link.href = canvas.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: "Profile image downloaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download profile image.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleShare} disabled={isGenerating}>
        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
        Share
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGenerating}>
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </div>
  )
}
