"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, Settings, Database } from "lucide-react"
import { storage } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { StorageMigration } from "@/components/storage-migration"

export function DataManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  const handleExport = () => {
    const data = storage.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `matrimonial_data_${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Data exported successfully!",
    })
  }

  const handleImport = () => {
    if (!importData.trim()) {
      toast({
        title: "Error",
        description: "Please paste valid JSON data.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = storage.importData(importData)
      if (success) {
        toast({
          title: "Success",
          description: "Data imported successfully!",
        })
        setImportData("")
        setIsOpen(false)
        // Trigger a custom event to update the users list
        window.dispatchEvent(new Event("users-updated"))
      } else {
        throw new Error("Import failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data. Please check the JSON format.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Management</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="storage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="import-export" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Import/Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="storage" className="mt-4">
            <StorageMigration />
          </TabsContent>

          <TabsContent value="import-export" className="mt-4">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Export Data</Label>
                <Button onClick={handleExport} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Download all user data as JSON file for backup</p>
              </div>

              <div>
                <Label htmlFor="import-data" className="text-sm font-medium mb-2 block">
                  Import Data
                </Label>
                <Textarea
                  id="import-data"
                  placeholder="Paste JSON data here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={6}
                />
                <Button onClick={handleImport} className="w-full mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
                <p className="text-xs text-muted-foreground mt-1">Import user data from a previously exported JSON file</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
