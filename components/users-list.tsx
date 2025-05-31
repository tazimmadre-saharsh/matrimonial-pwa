"use client"

import { useState, useEffect } from "react"
import type { User, FilterOptions } from "@/lib/types"
import { storage } from "@/lib/storage"
import { UserCard } from "@/components/user-card"
import { FilterTabs } from "@/components/filter-tabs"
import { SearchInput } from "@/components/search-input"
import { SortSelect } from "@/components/sort-select"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Grid3X3, LayoutGrid } from "lucide-react"

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    gender: "all",
    search: "",
    sortBy: "newest"
  })
  const [viewMode, setViewMode] = useState<"compact" | "full">("compact") // Default to compact

  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = storage.getUsers()
      setUsers(storedUsers)
    }

    loadUsers()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadUsers()
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    window.addEventListener("users-updated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("users-updated", handleStorageChange)
    }
  }, [])

  // Sorting function
  const sortUsers = (users: User[], sortBy: FilterOptions["sortBy"]) => {
    const sortedUsers = [...users]

    switch (sortBy) {
      case "newest":
        return sortedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return sortedUsers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "name-asc":
        return sortedUsers.sort((a, b) => a.fullName.localeCompare(b.fullName))
      case "name-desc":
        return sortedUsers.sort((a, b) => b.fullName.localeCompare(a.fullName))
      case "age-asc":
        return sortedUsers.sort((a, b) => a.age - b.age)
      case "age-desc":
        return sortedUsers.sort((a, b) => b.age - a.age)
      default:
        return sortedUsers
    }
  }

  useEffect(() => {
    let filtered = users

    // Apply gender filter
    if (filters.gender !== "all") {
      filtered = filtered.filter((user) => user.gender === filters.gender)
    }

    // Apply search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim()
      filtered = filtered.filter((user) => {
        const fullName = user.fullName.toLowerCase()
        const location = user.location.toLowerCase()
        const age = user.age.toString()
        const gender = user.gender.toLowerCase()

        return (
          fullName.includes(searchTerm) ||
          location.includes(searchTerm) ||
          age.includes(searchTerm) ||
          gender.includes(searchTerm)
        )
      })
    }

    // Apply sorting
    filtered = sortUsers(filtered, filters.sortBy)

    setFilteredUsers(filtered)
  }, [users, filters])

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleSearchChange = (searchValue: string) => {
    setFilters(prev => ({ ...prev, search: searchValue }))
  }

  const handleSortChange = (sortBy: FilterOptions["sortBy"]) => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  // Calculate user counts for filters (based on search results)
  const searchFilteredUsers = users.filter(user => {
    if (!filters.search.trim()) return true
    const searchTerm = filters.search.toLowerCase().trim()
    const fullName = user.fullName.toLowerCase()
    const location = user.location.toLowerCase()
    const age = user.age.toString()
    const gender = user.gender.toLowerCase()

    return (
      fullName.includes(searchTerm) ||
      location.includes(searchTerm) ||
      age.includes(searchTerm) ||
      gender.includes(searchTerm)
    )
  })

  const totalUsers = searchFilteredUsers.length
  const maleUsers = searchFilteredUsers.filter(user => user.gender === "male").length
  const femaleUsers = searchFilteredUsers.filter(user => user.gender === "female").length

  if (users.length === 0) {
    return (
      <Card className="text-center py-8 sm:py-12 mx-2 sm:mx-0">
        <CardContent className="px-4">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No users yet</h3>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Add your first user to get started with managing matrimonial profiles.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Grid layout classes based on view mode
  const gridClasses = viewMode === "compact"
    ? "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4" // Compact: 2 on mobile, 4 on desktop
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" // Full: current layout

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search Bar */}
      <SearchInput
        value={filters.search}
        onChange={handleSearchChange}
        placeholder="Search by name, location, age, or gender..."
        className="w-full"
      />

      {/* Filters and Controls Row */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center lg:justify-between">
        {/* Left side: Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-1">
          <FilterTabs
            filters={filters}
            onFiltersChange={handleFilterChange}
            totalUsers={totalUsers}
            maleUsers={maleUsers}
            femaleUsers={femaleUsers}
          />

          <SortSelect
            value={filters.sortBy}
            onChange={handleSortChange}
          />
        </div>

        {/* Right side: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto lg:ml-4">
          <Button
            variant={viewMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className="h-8 px-2 sm:px-3 flex-1 sm:flex-none"
          >
            <Grid3X3 className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Compact</span>
          </Button>
          <Button
            variant={viewMode === "full" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("full")}
            className="h-8 px-2 sm:px-3 flex-1 sm:flex-none"
          >
            <LayoutGrid className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Full</span>
          </Button>
        </div>
      </div>

      {/* Users Grid */}
      <div className={gridClasses}>
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} compact={viewMode === "compact"} />
        ))}
      </div>

      {/* No results message */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <Card className="text-center py-6 sm:py-8 mx-2 sm:mx-0">
          <CardContent className="px-4">
            {filters.search.trim() ? (
              <div>
                <p className="text-muted-foreground text-sm sm:text-base mb-2">
                  No profiles found matching "{filters.search}"
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Try searching by name, location, age, or gender
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm sm:text-base">
                No users found matching the current filters.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
