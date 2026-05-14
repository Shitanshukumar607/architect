"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import { useState } from "react"
import { CreateProjectDialog } from "./_components/create-project-dialog"
import { ProjectList } from "./_components/project-list"
import { useProjects } from "@/lib/queries"

export default function ProjectsPage() {
  const { data: projects = [], isLoading, refetch } = useProjects()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
          className="gap-2 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <CreateProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={() => refetch()}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ProjectList
          projects={projects}
          onCreateClick={() => setIsDialogOpen(true)}
        />
      )}
    </div>
  )
}
