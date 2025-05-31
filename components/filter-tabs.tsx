"use client"

import type { FilterOptions } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface FilterTabsProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  totalUsers?: number
  maleUsers?: number
  femaleUsers?: number
}

export function FilterTabs({
  filters,
  onFiltersChange,
  totalUsers = 0,
  maleUsers = 0,
  femaleUsers = 0
}: FilterTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
      <Tabs
        value={filters.gender}
        onValueChange={(value) => onFiltersChange({ ...filters, gender: value as FilterOptions["gender"] })}
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3 h-10">
          <TabsTrigger value="all" className="text-sm flex items-center gap-1.5">
            All
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto min-w-[1.5rem] text-center">
              {totalUsers}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="male" className="text-sm flex items-center gap-1.5">
            Male
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto min-w-[1.5rem] text-center">
              {maleUsers}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="female" className="text-sm flex items-center gap-1.5">
            Female
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto min-w-[1.5rem] text-center">
              {femaleUsers}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
