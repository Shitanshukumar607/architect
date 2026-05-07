"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Plus, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface EnvVar {
  id: string
  key: string
  value: string
}

interface Project {
  id: string
  name: string
  envVars: EnvVar[]
}

export default function ProjectEnvVarsPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isAddingVar, setIsAddingVar] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${baseUrl}/api/projects/name/${params.projectName}`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("Failed to load project variables")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddVar = async () => {
    if (!newKey || !newValue) return
    
    try {
      setIsAddingVar(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${baseUrl}/api/projects/name/${params.projectName}/env-vars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey, value: newValue }),
        credentials: "include",
      })

      if (response.ok) {
        toast.success("Variable added successfully")
        setNewKey("")
        setNewValue("")
        fetchProject()
      } else {
        toast.error("Failed to add variable")
      }
    } catch (error) {
      toast.error("An error occurred while adding the variable")
    } finally {
      setIsAddingVar(false)
    }
  }

  useEffect(() => {
    if (params.projectName) {
      fetchProject()
    }
  }, [params.projectName])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Environment Variables
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage environment variables for <span className="font-semibold text-foreground">{project.name}</span>
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Variable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Environment Variable</DialogTitle>
              <DialogDescription>
                Define a new key-value pair for your project's environment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  placeholder="API_KEY"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="password"
                  placeholder="••••••••"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddVar} disabled={isAddingVar}>
                {isAddingVar ? "Adding..." : "Add Variable"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          {project.envVars && project.envVars.length > 0 ? (
            <div className="w-full space-y-4">
               {project.envVars.map((env) => (
                 <div key={env.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-mono font-bold">{env.key}</span>
                      <span className="text-xs text-muted-foreground">Added recently</span>
                    </div>
                    <Badge variant="outline">••••••••</Badge>
                 </div>
               ))}
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No environment variables</h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Securely store API keys, secrets, and configuration values for this project.
              </p>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Variable
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
