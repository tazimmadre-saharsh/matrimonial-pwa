import type { User } from "./types"
import { blobStorage } from "./blob-storage"

const STORAGE_KEY = "matrimonial_users"

// Enhanced storage with blob support
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

  deleteUser: async (id: string): Promise<void> => {
    if (typeof window === "undefined") return
    try {
      const users = storage.getUsers()
      const userToDelete = users.find(user => user.id === id)
      
      // If user has blob images, delete them from IndexedDB
      if (userToDelete && userToDelete.imageType === "blob") {
        for (const imageId of userToDelete.images) {
          await blobStorage.deleteImage(imageId)
        }
        
        // Also delete biodata image if it's a blob
        if (userToDelete.biodata?.type === "image" && userToDelete.biodata.content) {
          await blobStorage.deleteImage(userToDelete.biodata.content)
        }
      }
      
      const remainingUsers = users.filter((user) => user.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingUsers))
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

  // Get display URLs for images (handles both base64 and blob)
  getImageUrls: async (user: User): Promise<string[]> => {
    if (!user.images.length) return []
    
    // If images are base64, return them directly
    if (!user.imageType || user.imageType === "base64") {
      return user.images
    }
    
    // If images are blob IDs, get URLs from blob storage
    const urls: string[] = []
    for (const imageId of user.images) {
      const url = await blobStorage.getImageUrl(imageId)
      if (url) {
        urls.push(url)
      }
    }
    return urls
  },

  // Get biodata content URL (handles both base64 and blob)
  getBiodataImageUrl: async (user: User): Promise<string | null> => {
    if (!user.biodata || user.biodata.type !== "image" || !user.biodata.content) {
      return null
    }
    
    // If biodata is base64, return it directly
    if (!user.imageType || user.imageType === "base64") {
      return user.biodata.content
    }
    
    // If biodata is blob ID, get URL from blob storage
    return await blobStorage.getImageUrl(user.biodata.content)
  },

  // Migration utility to convert existing base64 images to blobs
  migrateUserToBlob: async (userId: string): Promise<boolean> => {
    try {
      const user = storage.getUserById(userId)
      if (!user || user.imageType === "blob") {
        return false // User not found or already using blobs
      }

      console.log(`Migrating user ${userId} to blob storage...`)
      
      // Convert profile images
      const newImageIds: string[] = []
      for (let i = 0; i < user.images.length; i++) {
        const base64Image = user.images[i]
        if (base64Image.startsWith('data:')) {
          const imageId = await blobStorage.migrateBase64ToBlob(base64Image, `profile_${i}.jpg`)
          newImageIds.push(imageId)
        }
      }

      // Convert biodata image if exists
      let newBiodataContent = user.biodata?.content
      if (user.biodata?.type === "image" && user.biodata.content?.startsWith('data:')) {
        newBiodataContent = await blobStorage.migrateBase64ToBlob(user.biodata.content, 'biodata.jpg')
      }

      // Update user with blob IDs
      const updatedUser: User = {
        ...user,
        images: newImageIds,
        imageType: "blob",
        biodata: user.biodata ? {
          ...user.biodata,
          content: newBiodataContent || user.biodata.content
        } : undefined
      }

      storage.saveUser(updatedUser)
      console.log(`Successfully migrated user ${userId} to blob storage`)
      return true
    } catch (error) {
      console.error(`Error migrating user ${userId} to blob storage:`, error)
      return false
    }
  },

  // Migrate all users to blob storage
  migrateAllToBlob: async (): Promise<{ success: number; failed: number }> => {
    const users = storage.getUsers()
    let success = 0
    let failed = 0

    for (const user of users) {
      if (user.imageType !== "blob") {
        const migrated = await storage.migrateUserToBlob(user.id)
        if (migrated) {
          success++
        } else {
          failed++
        }
      }
    }

    return { success, failed }
  },

  // Get storage usage information
  getStorageInfo: async () => {
    const blobSize = await blobStorage.getStorageSize()
    const localStorageSize = new Blob([localStorage.getItem(STORAGE_KEY) || '']).size
    
    return {
      blobStorage: blobSize,
      localStorage: localStorageSize,
      total: blobSize + localStorageSize
    }
  }
}
