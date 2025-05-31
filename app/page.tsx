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
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Matrimonial Manager</h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <DataManager />
              <ModeToggle />

              {/* Desktop: Add User button */}
              <div className="hidden sm:block ml-2">
                <Link href="/add-user">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
        <UsersList />
      </main>

      {/* Mobile: Floating Action Button */}
      <div className="sm:hidden fixed bottom-6 right-4 z-50">
        <Link href="/add-user">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90 border-2 border-background"
          >
            <Plus className="w-6 h-6" />
            <span className="sr-only">Add New User</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
