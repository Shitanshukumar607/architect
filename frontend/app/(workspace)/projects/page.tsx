"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import Link from "next/link"
import { useEffect, useState } from "react"
import { CreateProjectDialog } from "./_components/create-project-dialog"

interface Project {
  id: string
  repoUrl: string
  createdAt: string
  framework: string
  buildCommand: string
  outputDir: string
  domains?: { hostname: string }[]
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
        <div className="flex w-full flex-col gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group relative flex flex-col justify-between bg-background/50 p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold transition-colors group-hover:text-primary">
                    <Link
                      href={`/projects/${project.id}`}
                      className="after:absolute after:inset-0"
                    >
                      {project.repoUrl.split("/").pop()?.replace(".git", "") ||
                        "Project"}
                    </Link>
                  </h3>
                  <Badge
                    variant="secondary"
                    className="relative z-10 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 transition-colors dark:text-emerald-400"
                  >
                    Active
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  {project.domains && project.domains.length > 0 && (
                    <a
                      href={`http://${project.domains[0].hostname}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{project.domains[0].hostname}</span>
                    </a>
                  )}

                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 flex items-center gap-1.5 transition-colors hover:text-foreground hover:underline"
                    >
                      <Image
                        src="/github.svg"
                        alt="GitHub"
                        width={14}
                        height={14}
                        className="brightness-0 dark:invert"
                      />
                      <span className="truncate font-medium">
                        {project.repoUrl
                          .replace("https://github.com/", "")
                          .replace("http://github.com/", "")}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-row items-center justify-between gap-4 text-sm text-muted-foreground sm:mt-0 sm:ml-6 sm:flex-col sm:items-end sm:border-l sm:border-border/50 sm:pl-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5" title="Framework">
                    <LayoutTemplate className="h-4 w-4" />
                    <span className="font-medium capitalize">
                      {project.framework || "Other"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Branch">
                    <GitBranch className="h-4 w-4" />
                    <span className="font-medium">main</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 whitespace-nowrap"
                    title="Deployed"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(project.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 ml-4 hidden items-center sm:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
