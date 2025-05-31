"use client"

import { useState, useEffect } from "react"
import type { User, FilterOptions } from "@/lib/types"
import { storage } from "@/lib/storage"
import { UserCard } from "@/components/user-card"
import { FilterTabs } from "@/components/filter-tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<FilterOptions>({ gender: "all" })

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

  useEffect(() => {
    let filtered = users

    if (filters.gender !== "all") {
      filtered = filtered.filter((user) => user.gender === filters.gender)
    }

    setFilteredUsers(filtered)
  }, [users, filters])

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <FilterTabs filters={filters} onFiltersChange={handleFilterChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {filteredUsers.length === 0 && users.length > 0 && (
        <Card className="text-center py-6 sm:py-8 mx-2 sm:mx-0">
          <CardContent className="px-4">
            <p className="text-muted-foreground text-sm sm:text-base">No users found matching the current filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
