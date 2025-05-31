export interface User {
  id: string
  fullName: string
  age: number
  location: string
  gender: "male" | "female"
  images: string[] // base64 encoded images
  biodata?: {
    type: "text" | "image"
    content: string
  }
  createdAt: string
}

export interface FilterOptions {
  gender: "all" | "male" | "female"
}
