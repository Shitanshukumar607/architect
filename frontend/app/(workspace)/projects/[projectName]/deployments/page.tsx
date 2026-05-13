"use client"

import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ProjectDeployments } from "../_components/project-deployments"
import { useProject } from "@/lib/queries"

export default function ProjectDeploymentsPage() {
  const params = useParams()
  const {
    data: project,
    isLoading,
    refetch: fetchProject,
  } = useProject(params.projectName as string)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-5 md:p-8">
      <div className="flex flex-col gap-1.5 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-muted-foreground">
          View and manage deployments for{" "}
          <span className="font-semibold text-foreground/80">
            {project.name}
          </span>
        </p>
      </div>
      <ProjectDeployments project={project} onRefresh={fetchProject} />
    </div>
  )
}
