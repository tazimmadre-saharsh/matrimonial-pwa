"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpDown, ArrowUp, ArrowDown, Calendar, User, Hash } from "lucide-react"
import type { FilterOptions } from "@/lib/types"

interface SortSelectProps {
  value: FilterOptions["sortBy"]
  onChange: (value: FilterOptions["sortBy"]) => void
  className?: string
}

export function SortSelect({ value, onChange, className = "" }: SortSelectProps) {
  const sortOptions = [
    {
      value: "newest" as const,
      label: "Newest First",
      icon: <Calendar className="w-4 h-4" />,
      description: "Recently added"
    },
    {
      value: "oldest" as const,
      label: "Oldest First",
      icon: <Calendar className="w-4 h-4" />,
      description: "Earliest added"
    },
    {
      value: "name-asc" as const,
      label: "Name A-Z",
      icon: <ArrowUp className="w-4 h-4" />,
      description: "Alphabetical"
    },
    {
      value: "name-desc" as const,
      label: "Name Z-A",
      icon: <ArrowDown className="w-4 h-4" />,
      description: "Reverse alphabetical"
    },
    {
      value: "age-asc" as const,
      label: "Age: Young to Old",
      icon: <ArrowUp className="w-4 h-4" />,
      description: "Youngest first"
    },
    {
      value: "age-desc" as const,
      label: "Age: Old to Young",
      icon: <ArrowDown className="w-4 h-4" />,
      description: "Oldest first"
    }
  ]

  const selectedOption = sortOptions.find(option => option.value === value)

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Sort by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-[180px] h-10">
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.icon}
                <div className="flex flex-col">
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 