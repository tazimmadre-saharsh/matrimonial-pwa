import type { User } from "./types"

const STORAGE_KEY = "matrimonial_users"

export const storage = {
  getUsers: (): User[] => {
    if (typeof window === "undefined") return []
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return []
    }
  },

  saveUser: (user: User): void => {
    console.log("STORAGE: saveUser called with:", user);
    if (typeof window === "undefined") {
      console.log("STORAGE: Window is undefined, returning early");
      return
    }
    try {
      console.log("STORAGE: Getting existing users...");
      const users = storage.getUsers()
      console.log("STORAGE: Existing users count:", users.length);
      
      const existingIndex = users.findIndex((u) => u.id === user.id)
      console.log("STORAGE: Existing user index:", existingIndex);

      if (existingIndex >= 0) {
        console.log("STORAGE: Updating existing user");
        users[existingIndex] = user
      } else {
        console.log("STORAGE: Adding new user");
        users.push(user)
      }

      console.log("STORAGE: Saving to localStorage...");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      console.log("STORAGE: Successfully saved to localStorage");
    } catch (error) {
      console.error("STORAGE ERROR:", error)
      console.error("Error saving to localStorage:", error)
    }
  },

  getUserById: (id: string): User | null => {
    const users = storage.getUsers()
    return users.find((user) => user.id === id) || null
  },

  deleteUser: (id: string): void => {
    if (typeof window === "undefined") return
    try {
      const users = storage.getUsers().filter((user) => user.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    } catch (error) {
      console.error("Error deleting from localStorage:", error)
    }
  },

  exportData: (): string => {
    return JSON.stringify(storage.getUsers(), null, 2)
  },

  importData: (jsonData: string): boolean => {
    if (typeof window === "undefined") return false
    try {
      const users = JSON.parse(jsonData) as User[]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
      return true
    } catch (error) {
      console.error("Error importing data:", error)
      return false
    }
  },
}
