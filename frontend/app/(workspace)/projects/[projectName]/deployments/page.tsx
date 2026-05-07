"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { ProjectDeployments } from "../_components/project-deployments"

interface Project {
  id: string
  name: string
  deployments: any[]
}

export default function ProjectDeploymentsPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    } finally {
      setIsLoading(false)
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
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
        <p className="text-lg text-muted-foreground">
          View and manage deployments for <span className="font-semibold text-foreground">{project.name}</span>
        </p>
      </div>
      <ProjectDeployments project={project} onRefresh={fetchProject} />
    </div>
  )
}
