"use client"

import { Badge } from "@/components/ui/badge"
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
import { useProject, useProjects } from "@/lib/queries"
import { Project } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FolderGit2,
  GitBranch,
  Loader2,
  Search,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Ready
        </Badge>
      )
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-red-500/20 bg-red-500/10 px-2 py-0.5 font-medium text-red-600 dark:text-red-400"
        >
          <XCircle className="h-3.5 w-3.5" />
          Error
        </Badge>
      )
    case "BUILDING":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Building
        </Badge>
      )
    case "QUEUED":
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 font-medium text-yellow-600 dark:text-yellow-400"
        >
          <Clock className="h-3.5 w-3.5" />
          Queued
        </Badge>
      )
    default:
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-gray-500/20 bg-gray-500/10 px-2 py-0.5 font-medium text-gray-600 dark:text-gray-400"
        >
          <Clock className="h-3.5 w-3.5" />
          Unknown
        </Badge>
      )
  }
}

function ProjectDeploymentRow({
  project: initialProject,
  searchQuery,
}: {
  project: Project
  searchQuery: string
}) {
  const { data: project, isLoading } = useProject(initialProject.name)

  const deployments = project?.deployments || []
  const latestDeployment = deployments.length > 0 ? deployments[0] : null

  const projectNameMatches = initialProject.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
  const branchMatches = (initialProject.branch || "main")
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
  const statusMatches = latestDeployment?.status
    .toLowerCase()
    .includes(searchQuery.toLowerCase())
  const idMatches = latestDeployment?.id
    .toLowerCase()
    .includes(searchQuery.toLowerCase())

  if (
    searchQuery &&
    !projectNameMatches &&
    !branchMatches &&
    !statusMatches &&
    !idMatches
  ) {
    return null
  }

  const createdLabel = latestDeployment
    ? formatDistanceToNow(new Date(latestDeployment.createdAt), {
        addSuffix: true,
      })
    : ""

  return (
    <TableRow className="group transition-colors hover:bg-muted/10">
      <TableCell className="px-4 py-4 align-top font-medium">
        <Link
          href={`/projects/${initialProject.name}`}
          className="transition-colors hover:text-primary hover:underline"
        >
          {initialProject.name}
        </Link>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        <div className="flex items-center gap-1.5 text-sm">
          <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{initialProject.branch || "main"}</span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 align-top">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : !latestDeployment ? (
          <span className="text-sm text-muted-foreground italic">
            No deployments yet
          </span>
        ) : (
          <div className="flex items-center gap-4">
            {getStatusBadge(latestDeployment.status)}
            <div className="flex flex-col">
              <span className="text-sm font-medium">{createdLabel}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {latestDeployment.id.substring(0, 8)}
              </span>
            </div>
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
          <Link href={`/projects/${initialProject.name}/deployments`}>
            Manage <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function DeploymentsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          Deployments
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          View the latest deployments and their statuses across all your
          projects.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, branches, or statuses..."
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
            You need to create a project before you can view its deployments.
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
                <TableHead className="w-[200px] px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Branch
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Latest Deployment
                </TableHead>
                <TableHead className="w-[100px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectDeploymentRow
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
