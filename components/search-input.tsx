"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search profiles...",
  className = ""
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(value)

  // Debounce search to avoid excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChange(searchValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue, onChange])

  // Update local state when prop changes (for external resets)
  useEffect(() => {
    setSearchValue(value)
  }, [value])

  const handleClear = () => {
    setSearchValue("")
    onChange("")
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10 pr-10 h-10"
      />
      {searchValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
} 