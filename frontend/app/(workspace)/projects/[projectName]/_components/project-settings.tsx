"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useUpdateProject } from "@/lib/queries"
import { Project } from "@/lib/types"
import { AlertTriangle, Copy, FolderOpen, GitBranch, Layout, Save, Terminal, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function ProjectSettings({
  project,
}: {
  project: Project
  onRefresh: () => void
}) {
  const router = useRouter()
  const { mutate: updateProject, isPending } = useUpdateProject()
  
  const [formData, setFormData] = useState({
    name: project.name,
    buildCommand: project.buildCommand || "",
    outputDir: project.outputDir || "dist",
    rootDirectory: project.rootDirectory || "/",
    branch: project.branch || "main",
    autoDeploy: project.autoDeploy ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleToggleAutoDeploy = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, autoDeploy: checked }))
  }

  const handleSave = (field: keyof typeof formData) => {
    const dataToUpdate = { [field]: formData[field] }
    
    updateProject({
      projectName: project.name,
      data: dataToUpdate
    }, {
      onSuccess: (updated) => {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`)
        if (field === 'name' && updated.name !== project.name) {
          router.push(`/projects/${updated.name}/settings`)
        }
      },
      onError: (error) => {
        toast.error(error.message || `Failed to update ${field}`)
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-20">
      {/* General Settings */}
      <Card className="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layout className="h-5 w-5 text-primary" />
            Project Name
          </CardTitle>
          <CardDescription>
            The name of your project, used in the dashboard and URLs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
            <Input 
              id="name"
              value={formData.name} 
              onChange={handleChange}
              className="rounded-xl border-border/50 bg-background/50 transition-all focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
          <Button 
            size="sm" 
            onClick={() => handleSave('name')}
            disabled={isPending || formData.name === project.name}
            className="gap-2 rounded-xl px-6"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Copy className="h-5 w-5 text-primary" />
            Project ID
          </CardTitle>
          <CardDescription>
            Unique identifier for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-md items-center gap-2">
            <Input value={project.id} readOnly className="rounded-xl border-border/50 bg-muted/50 font-mono text-sm" />
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-xl border-border/50 transition-all hover:bg-primary/10 hover:text-primary"
              onClick={() => copyToClipboard(project.id)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Build & Development */}
      <div className="pt-4">
        <h3 className="mb-4 text-xl font-semibold tracking-tight">Build & Development</h3>
        <div className="grid gap-6">
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5 text-primary" />
                Build Command
              </CardTitle>
              <CardDescription>
                How your application is compiled.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                id="buildCommand"
                value={formData.buildCommand} 
                onChange={handleChange}
                placeholder="npm run build"
                className="max-w-md rounded-xl border-border/50 bg-background/50 transition-all focus:ring-2 focus:ring-primary/20" 
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
              <Button 
                size="sm" 
                onClick={() => handleSave('buildCommand')}
                disabled={isPending || formData.buildCommand === project.buildCommand}
                className="gap-2 rounded-xl px-6"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
                Output Directory
              </CardTitle>
              <CardDescription>
                Where the build artifacts are stored.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                id="outputDir"
                value={formData.outputDir} 
                onChange={handleChange}
                placeholder="dist"
                className="max-w-md rounded-xl border-border/50 bg-background/50 transition-all focus:ring-2 focus:ring-primary/20" 
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
              <Button 
                size="sm" 
                onClick={() => handleSave('outputDir')}
                disabled={isPending || formData.outputDir === project.outputDir}
                className="gap-2 rounded-xl px-6"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
                Root Directory
              </CardTitle>
              <CardDescription>
                The directory containing your source code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                id="rootDirectory"
                value={formData.rootDirectory} 
                onChange={handleChange}
                placeholder="/"
                className="max-w-md rounded-xl border-border/50 bg-background/50 transition-all focus:ring-2 focus:ring-primary/20" 
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
              <Button 
                size="sm" 
                onClick={() => handleSave('rootDirectory')}
                disabled={isPending || formData.rootDirectory === project.rootDirectory}
                className="gap-2 rounded-xl px-6"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Git & Deployment */}
      <div className="pt-4">
        <h3 className="mb-4 text-xl font-semibold tracking-tight">Git & Deployment</h3>
        <div className="grid gap-6">
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 text-primary" />
                Production Branch
              </CardTitle>
              <CardDescription>
                Pushing to this branch triggers a production build.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                id="branch"
                value={formData.branch} 
                onChange={handleChange}
                placeholder="main"
                className="max-w-md rounded-xl border-border/50 bg-background/50 transition-all focus:ring-2 focus:ring-primary/20" 
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
              <Button 
                size="sm" 
                onClick={() => handleSave('branch')}
                disabled={isPending || formData.branch === project.branch}
                className="gap-2 rounded-xl px-6"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Image
                    src="/github.svg"
                    alt="GitHub"
                    width={18}
                    height={18}
                    className="brightness-0 dark:invert"
                  />
                  Automatic Deployments
                </CardTitle>
                <CardDescription>
                  Enable deployments on every push.
                </CardDescription>
              </div>
              <Switch 
                checked={formData.autoDeploy} 
                onCheckedChange={(checked) => {
                  handleToggleAutoDeploy(checked)
                  // Auto save for switch? Maybe better.
                }}
                className="data-[state=checked]:bg-primary"
              />
            </CardHeader>
            <CardFooter className="flex justify-end border-t bg-muted/30 px-6 py-3">
              <Button 
                size="sm" 
                onClick={() => handleSave('autoDeploy')}
                disabled={isPending || formData.autoDeploy === project.autoDeploy}
                className="gap-2 rounded-xl px-6"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-8">
        <h3 className="mb-4 text-xl font-semibold text-destructive">Danger Zone</h3>
        <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Project
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Permanently remove this project and all data. This action is irreversible.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end border-t border-destructive/10 bg-destructive/5 px-6 py-3">
            <Button variant="destructive" className="gap-2 rounded-xl px-6 transition-all hover:scale-105">
              <Trash2 className="h-4 w-4" />
              Delete Project
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
