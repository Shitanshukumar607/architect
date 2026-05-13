import { useState } from "react"
import { Loader2, GitBranch } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateProject } from "@/lib/queries"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [error, setError] = useState<string | null>(null)

  const { mutate: createProject, isPending: isLoading } = useCreateProject()

  const [formData, setFormData] = useState({
    repoUrl: "https://github.com/Shitanshukumar607/frontend-test",
    framework: "VITE",
    buildCommand: "npm run build",
    outputDir: "dist",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    createProject(formData, {
      onSuccess: () => {
        onProjectCreated()
        onOpenChange(false)
        // Reset form
        setFormData({
          repoUrl: "",
          framework: "VITE",
          buildCommand: "npm run build",
          outputDir: "dist",
        })
      },
      onError: (err) => {
        setError(err.message || "An error occurred")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Project</DialogTitle>
            <DialogDescription>
              Connect your repository to deploy it automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <div className="relative">
                <GitBranch className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/username/repo"
                  className="pl-9"
                  value={formData.repoUrl}
                  onChange={(e) => handleChange("repoUrl", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="framework">Framework Preset</Label>
              <Select
                value={formData.framework}
                onValueChange={(v) => handleChange("framework", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent className="p-1">
                  <SelectItem value="VITE">Vite</SelectItem>
                  <SelectItem value="STATIC">Static HTML/JS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buildCommand">Build Command</Label>
                <Input
                  id="buildCommand"
                  placeholder="npm run build"
                  value={formData.buildCommand}
                  onChange={(e) => handleChange("buildCommand", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="outputDir">Output Directory</Label>
                <Input
                  id="outputDir"
                  placeholder="dist"
                  value={formData.outputDir}
                  onChange={(e) => handleChange("outputDir", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
