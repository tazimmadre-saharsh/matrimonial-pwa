"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Database, HardDrive, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { storage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export function StorageMigration() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<{
    total: number
    migrated: number
    failed: number
    isComplete: boolean
  }>({ total: 0, migrated: 0, failed: 0, isComplete: false })
  const [storageInfo, setStorageInfo] = useState<{
    blobStorage: number
    localStorage: number
    total: number
  } | null>(null)

  const { toast } = useToast()

  const loadStorageInfo = async () => {
    try {
      const info = await storage.getStorageInfo()
      setStorageInfo(info)
    } catch (error) {
      console.error('Error loading storage info:', error)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const checkMigrationNeeded = () => {
    const users = storage.getUsers()
    return users.filter(user => !user.imageType || user.imageType === "base64").length
  }

  const startMigration = async () => {
    setIsLoading(true)

    try {
      const users = storage.getUsers()
      const usersToMigrate = users.filter(user => !user.imageType || user.imageType === "base64")

      setMigrationStatus({
        total: usersToMigrate.length,
        migrated: 0,
        failed: 0,
        isComplete: false
      })

      if (usersToMigrate.length === 0) {
        toast({
          title: "Migration Complete",
          description: "All users are already using blob storage!",
        })
        setMigrationStatus(prev => ({ ...prev, isComplete: true }))
        setIsLoading(false)
        return
      }

      let migrated = 0
      let failed = 0

      for (const user of usersToMigrate) {
        try {
          const success = await storage.migrateUserToBlob(user.id)
          if (success) {
            migrated++
          } else {
            failed++
          }
        } catch (error) {
          console.error(`Failed to migrate user ${user.id}:`, error)
          failed++
        }

        setMigrationStatus({
          total: usersToMigrate.length,
          migrated,
          failed,
          isComplete: false
        })
      }

      setMigrationStatus(prev => ({ ...prev, isComplete: true }))

      toast({
        title: "Migration Complete",
        description: `Successfully migrated ${migrated} users. ${failed > 0 ? `${failed} failed.` : ''}`,
        variant: failed > 0 ? "destructive" : "default"
      })

      // Reload storage info
      await loadStorageInfo()

    } catch (error) {
      console.error('Migration error:', error)
      toast({
        title: "Migration Error",
        description: "An error occurred during migration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const usersNeedingMigration = checkMigrationNeeded()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Storage Management
        </CardTitle>
        <CardDescription>
          Migrate your images from base64 to blob storage for better performance and storage efficiency.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Information */}
        {storageInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Blob Storage</p>
              <p className="text-lg font-bold">{formatBytes(storageInfo.blobStorage)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Local Storage</p>
              <p className="text-lg font-bold">{formatBytes(storageInfo.localStorage)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <HardDrive className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Total Used</p>
              <p className="text-lg font-bold">{formatBytes(storageInfo.total)}</p>
            </div>
          </div>
        )}

        {/* Migration Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Migration Status</h3>
              <p className="text-sm text-muted-foreground">
                {usersNeedingMigration > 0
                  ? `${usersNeedingMigration} users need migration to blob storage`
                  : "All users are using efficient blob storage"
                }
              </p>
            </div>
            <Badge variant={usersNeedingMigration > 0 ? "destructive" : "default"}>
              {usersNeedingMigration > 0 ? "Migration Needed" : "Up to Date"}
            </Badge>
          </div>

          {migrationStatus.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>
                  {migrationStatus.migrated + migrationStatus.failed} / {migrationStatus.total}
                </span>
              </div>
              <Progress
                value={((migrationStatus.migrated + migrationStatus.failed) / migrationStatus.total) * 100}
                className="h-2"
              />
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>{migrationStatus.migrated} migrated</span>
                </div>
                {migrationStatus.failed > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-red-600" />
                    <span>{migrationStatus.failed} failed</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {usersNeedingMigration > 0 && (
            <Button
              onClick={startMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Migrating..." : "Start Migration"}
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Benefits of Blob Storage:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• ~33% smaller storage size (no base64 encoding overhead)</li>
            <li>• Faster image loading and display</li>
            <li>• Better memory usage</li>
            <li>• Improved app performance with multiple images</li>
            <li>• Proper browser caching support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 