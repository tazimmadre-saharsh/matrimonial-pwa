"use client"

import type { FilterOptions } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterTabsProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function FilterTabs({ filters, onFiltersChange }: FilterTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
      <Tabs
        value={filters.gender}
        onValueChange={(value) => onFiltersChange({ ...filters, gender: value as FilterOptions["gender"] })}
      >
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-3 h-10">
          <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
          <TabsTrigger value="male" className="text-sm">Male</TabsTrigger>
          <TabsTrigger value="female" className="text-sm">Female</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
