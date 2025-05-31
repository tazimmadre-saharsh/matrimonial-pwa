import { UsersList } from "@/components/users-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { DataManager } from "@/components/data-manager"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile-friendly header layout */}
          <div className="flex items-center justify-between mb-3 sm:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Matrimonial Manager</h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <DataManager />
              <ModeToggle />
            </div>
          </div>
          
          {/* Mobile: Add User button full width below title */}
          <div className="sm:hidden">
            <Link href="/add-user" className="block w-full">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </Link>
          </div>
          
          {/* Desktop: Original layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div></div> {/* Spacer */}
            <Link href="/add-user">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <UsersList />
      </main>
    </div>
  )
}
