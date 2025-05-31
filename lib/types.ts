export interface User {
  id: string
  fullName: string
  age: number
  location: string
  gender: "male" | "female"
  images: string[] // Can be base64 encoded images OR blob IDs
  imageType?: "base64" | "blob" // Indicates storage type, defaults to base64 for backward compatibility
  biodata?: {
    type: "text" | "image"
    content: string // Can be base64 or blob ID depending on imageType
  }
  createdAt: string
}

export interface FilterOptions {
  gender: "all" | "male" | "female"
}
