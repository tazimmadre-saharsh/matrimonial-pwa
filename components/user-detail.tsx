"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { storage } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageCarousel } from "@/components/image-carousel"
import { ShareProfile } from "@/components/share-profile"
import { MapPin, Calendar, UserIcon, FileText, ImageIcon, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [biodataImageUrl, setBiodataImageUrl] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      const userData = storage.getUserById(userId)
      if (userData) {
        setUser(userData)

        // Load image URLs
        const urls = await storage.getImageUrls(userData)
        setImageUrls(urls)

        // Load biodata image URL if exists
        if (userData.biodata?.type === "image") {
          const biodataUrl = await storage.getBiodataImageUrl(userData)
          setBiodataImageUrl(biodataUrl)
        }
      }
    }

    loadUserData()
  }, [userId])

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
    setDeleteConfirmation("")
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      toast({
        title: "Invalid confirmation",
        description: 'Please type "delete" to confirm deletion.',
        variant: "destructive",
      })
      return
    }

    if (!user) return

    setIsDeleting(true)

    try {
      await storage.deleteUser(user.id)

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("users-updated"))

      toast({
        title: "User deleted",
        description: `${user.fullName}'s profile has been successfully deleted.`,
      })

      // Navigate back to home page
      router.push("/")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setDeleteConfirmation("")
  }

  if (!user) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    )
  }

  const isDeleteConfirmationValid = deleteConfirmation.toLowerCase() === "delete"

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <Card id="profile-card">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
            <div className="w-full sm:w-auto">
              <CardTitle className="text-xl sm:text-2xl mb-2">{user.fullName}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{user.age} years old</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{user.location}</span>
                </div>
                <Badge variant={user.gender === "male" ? "default" : "secondary"} className="text-xs">
                  {user.gender}
                </Badge>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <ShareProfile user={user} />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Profile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <ImageCarousel images={imageUrls} alt={user.fullName} />
        </CardContent>
      </Card>

      {/* User Information */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UserIcon className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium mb-1 text-sm sm:text-base">Full Name</h4>
              <p className="text-muted-foreground text-sm sm:text-base">{user.fullName}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-sm sm:text-base">Age</h4>
              <p className="text-muted-foreground text-sm sm:text-base">{user.age} years old</p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-sm sm:text-base">Gender</h4>
              <p className="text-muted-foreground text-sm sm:text-base capitalize">{user.gender}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1 text-sm sm:text-base">Location</h4>
              <p className="text-muted-foreground text-sm sm:text-base">{user.location}</p>
            </div>
            <div className="sm:col-span-2">
              <h4 className="font-medium mb-1 text-sm sm:text-base">Profile Created</h4>
              <p className="text-muted-foreground text-sm sm:text-base">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biodata */}
      {user.biodata && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              {user.biodata.type === "text" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              Biodata
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {user.biodata.type === "text" ? (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{user.biodata.content}</p>
              </div>
            ) : (
              <div className="max-w-sm sm:max-w-md mx-auto">
                  {biodataImageUrl && (
                    <Image
                      src={biodataImageUrl}
                      alt="Biodata"
                      width={400}
                      height={600}
                      className="w-full h-auto rounded-lg border"
                    />
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Profile
            </DialogTitle>
            <DialogDescription className="text-left space-y-2">
              <div>
                This action cannot be undone. This will permanently delete{" "}
                <strong>{user.fullName}</strong>'s profile and remove all associated data.
              </div>
              <div>
                To confirm deletion, please type <strong>"delete"</strong> in the field below:
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation">Confirmation</Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder='Type "delete" to confirm'
              className={`${deleteConfirmation && !isDeleteConfirmationValid
                ? "border-destructive focus:ring-destructive"
                : ""
                }`}
            />
            {deleteConfirmation && !isDeleteConfirmationValid && (
              <p className="text-sm text-destructive">
                Please type "delete" exactly as shown
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={!isDeleteConfirmationValid || isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
