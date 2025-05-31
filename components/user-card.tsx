"use client"

import type { User } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  const primaryImage = user.images[0] || "/placeholder.svg?height=200&width=200"

  return (
    <Link href={`/user/${user.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-95 transition-transform">
        <div className="aspect-square relative">
          <Image src={primaryImage || "/placeholder.svg"} alt={user.fullName} fill className="object-cover" />
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
