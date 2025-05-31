"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { storage } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageCarousel } from "@/components/image-carousel"
import { ShareProfile } from "@/components/share-profile"
import { MapPin, Calendar, UserIcon, FileText, ImageIcon } from "lucide-react"
import Image from "next/image"

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [biodataImageUrl, setBiodataImageUrl] = useState<string | null>(null)

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

  if (!user) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    )
  }

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
            <div className="w-full sm:w-auto">
              <ShareProfile user={user} />
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
    </div>
  )
}
