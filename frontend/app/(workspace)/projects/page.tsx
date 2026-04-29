"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import {
  Clock,
  FolderGit2,
  GitBranch,
  Globe,
  LayoutTemplate,
  Loader2,
  MoreVertical,
  Plus,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { CreateProjectDialog } from "./_components/create-project-dialog"

interface Project {
  id: string
  name: string
  repoUrl: string
  createdAt: string
  framework: string
  buildCommand: string
  outputDir: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${baseUrl}/api/projects`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Projects
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Manage your applications and deployments.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={fetchProjects}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed bg-background/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <FolderGit2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Create your first project to start deploying your applications to
              our global edge network.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group flex h-full cursor-pointer flex-col bg-background/50 transition-colors hover:border-primary/50"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl transition-colors group-hover:text-primary">
                      {project.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      Production
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" />
                    <a
                      href="#"
                      className="transition-colors hover:text-foreground hover:underline"
                    >
                      {project.name}.vercel.app
                    </a>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mr-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="mt-auto flex-1 pb-4">
                <div className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/50 p-2 text-sm text-muted-foreground">
                  <Image
                    src="/github.svg"
                    alt="GitHub"
                    width={16}
                    height={16}
                    className="brightness-0 dark:invert"
                  />
                  <span className="truncate font-medium">
                    {project.repoUrl
                      ? project.repoUrl
                          .replace("https://github.com/", "")
                          .replace("http://github.com/", "")
                      : "No repository"}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    <span className="capitalize">
                      {project.framework || "Other"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    main
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
