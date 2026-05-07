"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, Plus, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Domain {
  id: string
  hostname: string
  verified: boolean
}

interface Project {
  id: string
  name: string
  domains: Domain[]
}

export default function ProjectDomainsPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [newDomain, setNewDomain] = useState("")

  const fetchProject = async () => {
    try {
      setIsLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(
        `${baseUrl}/api/projects/name/${params.projectName}`,
        {
          credentials: "include",
        }
      )
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("Failed to load project domains")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain) return

    try {
      setIsAddingDomain(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(
        `${baseUrl}/api/projects/name/${params.projectName}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostname: newDomain }),
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Domain added successfully")
        setNewDomain("")
        fetchProject()
      } else {
        toast.error("Failed to add domain")
      }
    } catch (error) {
      toast.error("An error occurred while adding the domain")
    } finally {
      setIsAddingDomain(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-lg text-muted-foreground">
            Manage custom domains for{" "}
            <span className="font-semibold text-foreground">
              {project.name}
            </span>
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Enter the hostname you want to associate with this project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddDomain} disabled={isAddingDomain}>
                {isAddingDomain ? "Adding..." : "Add Domain"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          {project.domains && project.domains.length > 0 ? (
            <div className="w-full space-y-4">
              {project.domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{domain.hostname}</span>
                  </div>
                  <Badge variant={domain.verified ? "default" : "secondary"}>
                    {domain.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                No domains assigned
              </h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Add a custom domain to make your project accessible via your own
                URL.
              </p>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Domain
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
