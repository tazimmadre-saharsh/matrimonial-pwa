"use client"

import { useState } from "react"
import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Share2, Download, Loader2, Eye, Monitor, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"
import { ShareableProfileCard } from "@/components/shareable-profile-card"

interface ShareProfileProps {
  user: User
}

export function ShareProfile({ user }: ShareProfileProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("full")
  const { toast } = useToast()

  const generateProfileImage = async (cardId: string) => {
    setIsGenerating(true)
    try {
      const element = document.getElementById(cardId)
      if (!element) {
        throw new Error("Shareable profile card not found")
      }

      // Temporarily make the card visible if it's in a hidden dialog
      const dialog = element.closest('[role="dialog"]')
      const wasHidden = dialog && window.getComputedStyle(dialog).display === 'none'

      if (wasHidden) {
        (dialog as HTMLElement).style.display = 'block'
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      })

      // Restore original display if it was hidden
      if (wasHidden) {
        (dialog as HTMLElement).style.display = 'none'
      }

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
      // First open the preview to generate the card
      setIsPreviewOpen(true)

      // Wait a bit for the card to render
      await new Promise(resolve => setTimeout(resolve, 1000))

      const cardId = activeTab === "full" ? "shareable-profile-card-full" : "shareable-profile-card-compact"
      const { imageBlob } = await generateProfileImage(cardId)

      const suffix = activeTab === "full" ? "_detailed" : "_compact"
      const file = new File([imageBlob], `${user.fullName}_matrimonial_profile${suffix}.png`, {
        type: "image/png",
      })

      if (navigator.share && navigator.canShare) {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${user.fullName} - Matrimonial Profile`,
            text: `Check out ${user.fullName}'s matrimonial profile`,
            files: [file],
          })
          setIsPreviewOpen(false)
          return
        }
      }

      // Fallback to download
      handleDownload()
    } catch (error) {
      console.error("Share error:", error)
      toast({
        title: "Error",
        description: "Failed to share profile. Please try downloading instead.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    try {
      // First open the preview to generate the card
      if (!isPreviewOpen) {
        setIsPreviewOpen(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      const cardId = activeTab === "full" ? "shareable-profile-card-full" : "shareable-profile-card-compact"
      const { canvas } = await generateProfileImage(cardId)

      const link = document.createElement("a")
      const suffix = activeTab === "full" ? "_detailed" : "_compact"
      link.download = `${user.fullName}_matrimonial_profile${suffix}.png`
      link.href = canvas.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Success",
        description: `Profile image downloaded successfully! (${activeTab} version)`,
      })

      setIsPreviewOpen(false)
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: "Failed to download profile image.",
        variant: "destructive",
      })
    }
  }

  const handlePreview = () => {
    setIsPreviewOpen(true)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" onClick={handlePreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Profile Preview & Share</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="full" className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Full Version
                </TabsTrigger>
                <TabsTrigger value="compact" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Compact Version
                </TabsTrigger>
              </TabsList>

              <TabsContent value="full" className="mt-0">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <Monitor className="w-4 h-4 inline mr-1" />
                    Perfect for detailed sharing, printing, or desktop viewing. Shows all images and complete information.
                  </p>
                </div>
                <div id="shareable-profile-card-full" className="w-full">
                  <ShareableProfileCard user={user} compact={false} />
                </div>
              </TabsContent>

              <TabsContent value="compact" className="mt-0">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600">
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Optimized for social media sharing and mobile viewing. Compact design with essential information.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div id="shareable-profile-card-compact" className="w-full max-w-lg">
                    <ShareableProfileCard user={user} compact={true} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={handleDownload} disabled={isGenerating}>
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Download className="w-4 h-4 mr-2" />
                Download {activeTab === "full" ? "Full" : "Compact"}
              </Button>
              <Button onClick={handleShare} disabled={isGenerating}>
                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Share2 className="w-4 h-4 mr-2" />
                Share {activeTab === "full" ? "Full" : "Compact"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
