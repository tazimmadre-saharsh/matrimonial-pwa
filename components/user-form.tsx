"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"
import { storage } from "@/lib/storage"
import { userSchema, type UserFormData } from "@/lib/validations"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import React from "react"

export function UserForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [biodataType, setBiodataType] = useState<"text" | "image">("text")
  const [biodataImage, setBiodataImage] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      images: [], // Initialize images field
    }
  })

  const watchGender = watch("gender")

  // Register the images field
  React.useEffect(() => {
    register("images", { required: "At least one image is required" })
  }, [register])

  // Update form when images change
  React.useEffect(() => {
    setValue("images", images, { shouldValidate: true })
  }, [images, setValue])

  const onSubmit = async (data: UserFormData) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("1. Form data received:", data);
    console.log("2. Images state:", images);
    console.log("3. Form errors:", errors);
    console.log("4. Biodata type:", biodataType);
    console.log("5. Biodata image:", biodataImage ? "set" : "empty");
    
    // Manual validation check for images
    if (images.length === 0) {
      console.log("6. VALIDATION FAILED: No images uploaded");
      toast({
        title: "Validation Error",
        description: "At least one image is required.",
        variant: "destructive",
      })
      return;
    }

    console.log("7. Images validation passed, proceeding...");
    setIsLoading(true)
    
    try {
      console.log("8. Creating user object...");
      
      // Determine if biodata should be included
      const shouldIncludeBiodata = () => {
        if (biodataType === "text") {
          return data.biodata?.content && data.biodata.content.trim() !== "";
        } else {
          return biodataImage && biodataImage.trim() !== "";
        }
      };

      const user: User = {
        id: Date.now().toString(),
        ...data,
        images,
        imageType: "blob", // New users use blob storage
        biodata: shouldIncludeBiodata()
          ? {
              type: biodataType,
              content: biodataType === "image" ? biodataImage : data.biodata?.content || "",
            }
          : undefined,
        createdAt: new Date().toISOString(),
      }

      console.log("9. User object created:", user);
      console.log("10. Attempting to save user to storage...");
      
      storage.saveUser(user)
      console.log("11. User saved successfully to storage");
      
      // Dispatch custom event to notify other components
      console.log("12. Dispatching users-updated event...");
      window.dispatchEvent(new Event("users-updated"))
      console.log("13. Event dispatched");
      
      console.log("14. Showing success toast...");
      toast({
        title: "Success",
        description: "User profile created successfully!",
      })
      console.log("15. Toast shown, attempting navigation...");
      
      router.push("/")
      console.log("16. Navigation completed");
    } catch (error) {
      console.error("ERROR in form submission:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to create user profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log("17. Setting loading to false");
      setIsLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered");
    console.log("Current form state:", {
      images: images.length,
      biodataType,
      biodataImage: biodataImage ? "set" : "empty"
    });
    console.log("Current form errors:", errors);
    console.log("All form values:", watch());
    
    // Check if form is valid before submitting
    const formData = watch();
    console.log("Form validation check - data:", formData);
    
    handleSubmit(onSubmit, (errors) => {
      console.log("=== FORM VALIDATION FAILED ===");
      console.log("Validation errors:", errors);
      
      // Show specific error messages
      Object.entries(errors).forEach(([field, error]) => {
        console.log(`Field ${field}:`, error.message);
        toast({
          title: "Validation Error",
          description: `${field}: ${error.message}`,
          variant: "destructive",
        })
      });
    })(e);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Create New Profile</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" {...register("fullName")} placeholder="Enter full name" className="h-11" />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" {...register("age", { valueAsNumber: true })} placeholder="Enter age" className="h-11" />
              {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => setValue("gender", value as "male" | "female")} value={watchGender}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" {...register("location")} placeholder="Enter location" className="h-11" />
            {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Profile Images *</Label>
            <ImageUpload
              images={images}
              onImagesChange={(newImages) => {
                console.log("Images changed:", newImages.length);
                setImages(newImages)
              }}
              maxImages={5}
            />
            {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Biodata (Optional)</Label>
            <Tabs value={biodataType} onValueChange={(value) => {
              setBiodataType(value as "text" | "image");
            }}>
              <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="text" className="text-sm">Text</TabsTrigger>
                <TabsTrigger value="image" className="text-sm">Image</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-2 mt-3">
                <Textarea {...register("biodata.content")} placeholder="Enter biodata information..." rows={4} className="resize-none" />
              </TabsContent>
              <TabsContent value="image" className="space-y-2 mt-3">
                <ImageUpload
                  images={biodataImage ? [biodataImage] : []}
                  onImagesChange={(newImages) => setBiodataImage(newImages[0] || "")}
                  maxImages={1}
                  label="Upload biodata image"
                  useBlob={true}
                />
              </TabsContent>
            </Tabs>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
