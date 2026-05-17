"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEnvVars, useProjects } from "@/lib/queries"
import { Project } from "@/lib/types"
import { ChevronRight, FolderGit2, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

function ProjectRow({
  project,
  searchQuery,
}: {
  project: Project
  searchQuery: string
}) {
  const { data: envVars = [], isLoading } = useEnvVars(project.name)

  const hasEnvVars = envVars.length > 0

  const projectNameMatches = project.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
  const envVarMatches = envVars.some((e) =>
    e.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (searchQuery && !projectNameMatches && !envVarMatches) {
    return null
  }

  return (
    <TableRow className="group transition-colors hover:bg-muted/10">
      <TableCell className="px-4 py-4 align-top font-medium">
        <Link
          href={`/projects/${project.name}`}
          className="transition-colors hover:text-primary hover:underline"
        >
          {project.name}
        </Link>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : !hasEnvVars ? (
          <span className="text-sm text-muted-foreground italic">
            No environment variables configured
          </span>
        ) : (
          <div className="flex flex-col gap-2">
            {envVars.map((env) => (
              <div key={env.id} className="flex items-center gap-3">
                <code className="rounded-md bg-muted/50 px-2 py-1 font-mono text-xs text-foreground">
                  {env.key}
                </code>
              </div>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="px-4 py-4 text-right align-top">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-mt-1.5 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Link href={`/projects/${project.name}/environment-variables`}>
            Manage <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function EnvVarsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          Environment Variables
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          View and manage environment variables across all your projects.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects or variables..."
          className="rounded-xl border-border/50 bg-background/50 pl-10 focus-visible:ring-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background/50 py-20 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <FolderGit2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            You need to create a project before you can manage its environment
            variables.
          </p>
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/projects">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background/60 shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[250px] px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Project
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Variables
                </TableHead>
                <TableHead className="w-[100px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  searchQuery={searchQuery}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
