"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  if (images.length === 0) {
    return (
      <Card className="aspect-square flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No images available</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Image */}
      <Card className="relative overflow-hidden">
        <div className="aspect-square relative">
          <Image
            src={images[currentIndex] || "/placeholder.svg"}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 touch-manipulation w-10 h-10 sm:w-auto sm:h-auto p-2"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100 touch-manipulation w-10 h-10 sm:w-auto sm:h-auto p-2"
                onClick={goToNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {images.map((image, index) => (
            <Card
              key={index}
              className={`flex-shrink-0 cursor-pointer transition-all touch-manipulation snap-start ${
                index === currentIndex ? "ring-2 ring-primary scale-105" : "opacity-60 hover:opacity-80 active:scale-95"
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${alt} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
