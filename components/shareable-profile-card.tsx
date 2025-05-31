"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Heart, UserIcon } from "lucide-react"
import Image from "next/image"
import { storage } from "@/lib/storage"

interface ShareableProfileCardProps {
  user: User
  className?: string
  compact?: boolean // For social media sharing
}

export function ShareableProfileCard({ user, className = "", compact = false }: ShareableProfileCardProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [biodataImageUrl, setBiodataImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadImages = async () => {
      // Load profile images
      const urls = await storage.getImageUrls(user)
      setImageUrls(urls)

      // Load biodata image if exists
      if (user.biodata?.type === "image") {
        const biodataUrl = await storage.getBiodataImageUrl(user)
        setBiodataImageUrl(biodataUrl)
      }
    }

    loadImages()
  }, [user])

  if (compact) {
    // Compact version for social media
    return (
      <div className={`bg-white w-full max-w-lg mx-auto ${className}`}>
        {/* Header with branding */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-5 h-5" />
            <h1 className="text-lg font-bold">Matrimonial Profile</h1>
          </div>
        </div>

        {/* Main Profile Section */}
        <div className="p-4 space-y-4">
          {/* Profile Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              {imageUrls.length > 0 && (
                <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-rose-200 mx-auto">
                  <Image
                    src={imageUrls[0]}
                    alt={user.fullName}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Badge
                variant={user.gender === "male" ? "default" : "secondary"}
                className="absolute -bottom-1 -right-1 text-xs"
              >
                {user.gender}
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
              <div className="flex items-center justify-center gap-3 mt-1 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{user.age} years</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{user.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Images Grid - Show max 4 */}
          {imageUrls.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 text-center">Photos</h3>
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.slice(1, 5).map((imageUrl, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={imageUrl}
                      alt={`${user.fullName} - Photo ${index + 2}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {imageUrls.length > 5 && (
                <p className="text-center text-xs text-gray-500">
                  +{imageUrls.length - 5} more photos
                </p>
              )}
            </div>
          )}

          {/* Biodata Section - Compact */}
          {user.biodata && user.biodata.type === "text" && (
            <div className="bg-rose-50 p-3 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {user.biodata.content}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-3 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-rose-600">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Matrimonial Manager</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full version for desktop sharing
  return (
    <div className={`bg-white min-h-screen w-full max-w-4xl mx-auto ${className}`}>
      {/* Header with branding */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Matrimonial Profile</h1>
        </div>
        <p className="text-rose-100 text-sm">Finding the perfect match</p>
      </div>

      {/* Main Profile Section */}
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            {imageUrls.length > 0 && (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-200 mx-auto">
                <Image
                  src={imageUrls[0]}
                  alt={user.fullName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Badge
              variant={user.gender === "male" ? "default" : "secondary"}
              className="absolute -bottom-2 -right-2 text-xs"
            >
              {user.gender}
            </Badge>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
            <div className="flex items-center justify-center gap-4 mt-2 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{user.age} years old</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Images Grid */}
        {imageUrls.length > 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Photo Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imageUrls.slice(1).map((imageUrl, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={imageUrl}
                    alt={`${user.fullName} - Photo ${index + 2}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Information */}
        <Card className="border-rose-200">
          <CardHeader className="bg-rose-50">
            <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <p className="text-lg text-gray-800">{user.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-lg text-gray-800">{user.age} years old</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-lg text-gray-800 capitalize">{user.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-lg text-gray-800">{user.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biodata Section */}
        {user.biodata && (
          <Card className="border-rose-200">
            <CardHeader className="bg-rose-50">
              <h3 className="text-xl font-semibold text-gray-800">About</h3>
            </CardHeader>
            <CardContent className="p-6">
              {user.biodata.type === "text" ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {user.biodata.content}
                  </p>
                </div>
              ) : (
                biodataImageUrl && (
                  <div className="text-center">
                    <Image
                      src={biodataImageUrl}
                      alt="Biodata"
                      width={400}
                      height={600}
                      className="max-w-full h-auto rounded-lg border mx-auto"
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Profile created on {new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-rose-600">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">Matrimonial Manager</span>
          </div>
        </div>
      </div>
    </div>
  )
} 