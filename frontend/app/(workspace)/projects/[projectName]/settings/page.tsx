"use client"

import { fetchProjects } from "@/lib/api"
import { useProject } from "@/lib/queries"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { ProjectSettings } from "../_components/project-settings"

export default function ProjectSettingsPage() {
  const params = useParams()
  const { data: project, isLoading } = useProject(params.projectName as string)

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Project settings for <span className="font-medium text-foreground underline decoration-primary/30 underline-offset-4">{project.name}</span>
        </p>
      </div>
      <ProjectSettings project={project} onRefresh={fetchProjects} />
    </div>
  )
}
