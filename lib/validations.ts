import { z } from "zod"

export const userSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender" }),
  images: z.array(z.string()).min(1, "At least one image is required"),
  biodata: z
    .object({
      type: z.enum(["text", "image"]).optional(),
      content: z.string().optional(),
    })
    .optional(),
})

export type UserFormData = z.infer<typeof userSchema>
