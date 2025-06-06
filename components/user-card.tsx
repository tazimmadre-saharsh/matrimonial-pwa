"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { storage } from "@/lib/storage"

interface UserCardProps {
  user: User
  compact?: boolean
}

export function UserCard({ user, compact = false }: UserCardProps) {
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string>("/placeholder.svg?height=200&width=200")

  useEffect(() => {
    const loadPrimaryImage = async () => {
      if (user.images.length > 0) {
        const imageUrls = await storage.getImageUrls(user)
        if (imageUrls.length > 0) {
          setPrimaryImageUrl(imageUrls[0])
        }
      }
    }

    loadPrimaryImage()
  }, [user])

  if (compact) {
    // Compact version for grid layout
    return (
      <Link href={`/user/${user.id}`}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer touch-manipulation active:scale-95 transition-transform">
          <div className="aspect-square relative">
            <Image src={primaryImageUrl} alt={user.fullName} fill className="object-contain" />
            <Badge variant={user.gender === "male" ? "default" : "secondary"} className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5">
              {user.gender}
            </Badge>
          </div>
          <CardContent className="p-2 sm:p-3">
            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-1 leading-tight">{user.fullName}</h3>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{user.age}y</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="line-clamp-1 text-xs">{user.location}</span>
              </div>
            </div>
            {user.biodata && (
              <Badge variant="outline" className="mt-1.5 text-xs px-1.5 py-0.5 h-auto">
                Biodata
              </Badge>
            )}
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Full version (original design)
  return (
    <Link href={`/user/${user.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-95 transition-transform">
        <div className="aspect-square relative">
          <Image src={primaryImageUrl} alt={user.fullName} fill className="object-contain" />
          <Badge variant={user.gender === "male" ? "default" : "secondary"} className="absolute top-2 right-2 text-xs">
            {user.gender}
          </Badge>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{user.fullName}</h3>
          <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span>{user.age} years old</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1">{user.location}</span>
            </div>
          </div>
          {user.biodata && (
            <Badge variant="outline" className="mt-2 text-xs">
              Has biodata
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
