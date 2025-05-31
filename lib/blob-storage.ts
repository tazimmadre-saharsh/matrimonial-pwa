// Blob storage utility for efficient image handling
interface ImageBlob {
  id: string
  blob: Blob
  fileName: string
  mimeType: string
  createdAt: string
}

interface StoredImageRef {
  id: string
  url: string // blob URL for display
  fileName: string
  mimeType: string
}

class BlobStorage {
  private dbName = 'matrimonial_images'
  private dbVersion = 1
  private storeName = 'images'
  private db: IDBDatabase | null = null
  private urlCache = new Map<string, string>()

  async init(): Promise<void> {
    if (typeof window === 'undefined') return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  async storeImage(file: File): Promise<string> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const imageBlob: ImageBlob = {
      id: imageId,
      blob: file,
      fileName: file.name,
      mimeType: file.type,
      createdAt: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(imageBlob)

      request.onsuccess = () => {
        // Create and cache blob URL
        const url = URL.createObjectURL(file)
        this.urlCache.set(imageId, url)
        resolve(imageId)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getImageUrl(imageId: string): Promise<string | null> {
    // Check cache first
    if (this.urlCache.has(imageId)) {
      return this.urlCache.get(imageId)!
    }

    await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(imageId)

      request.onsuccess = () => {
        const result = request.result as ImageBlob
        if (result) {
          const url = URL.createObjectURL(result.blob)
          this.urlCache.set(imageId, url)
          resolve(url)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async deleteImage(imageId: string): Promise<void> {
    await this.init()
    if (!this.db) return

    // Revoke blob URL and remove from cache
    if (this.urlCache.has(imageId)) {
      URL.revokeObjectURL(this.urlCache.get(imageId)!)
      this.urlCache.delete(imageId)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(imageId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllImages(): Promise<StoredImageRef[]> {
    await this.init()
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = async () => {
        const results = request.result as ImageBlob[]
        const imageRefs: StoredImageRef[] = []

        for (const imageBlob of results) {
          let url = this.urlCache.get(imageBlob.id)
          if (!url) {
            url = URL.createObjectURL(imageBlob.blob)
            this.urlCache.set(imageBlob.id, url)
          }

          imageRefs.push({
            id: imageBlob.id,
            url,
            fileName: imageBlob.fileName,
            mimeType: imageBlob.mimeType
          })
        }

        resolve(imageRefs)
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Utility to convert base64 to blob and store it
  async migrateBase64ToBlob(base64Data: string, fileName: string = 'image.jpg'): Promise<string> {
    try {
      // Extract mime type and data from base64 string
      const [header, data] = base64Data.split(',')
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
      
      // Convert base64 to blob
      const byteString = atob(data)
      const arrayBuffer = new ArrayBuffer(byteString.length)
      const uint8Array = new Uint8Array(arrayBuffer)
      
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i)
      }
      
      const blob = new Blob([arrayBuffer], { type: mimeType })
      const file = new File([blob], fileName, { type: mimeType })
      
      return await this.storeImage(file)
    } catch (error) {
      console.error('Error migrating base64 to blob:', error)
      throw error
    }
  }

  // Cleanup method to revoke all URLs
  cleanup(): void {
    this.urlCache.forEach((url) => URL.revokeObjectURL(url))
    this.urlCache.clear()
  }

  // Get storage size estimation
  async getStorageSize(): Promise<number> {
    if (!navigator.storage || !navigator.storage.estimate) return 0
    
    try {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    } catch {
      return 0
    }
  }
}

export const blobStorage = new BlobStorage()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    blobStorage.cleanup()
  })
} 