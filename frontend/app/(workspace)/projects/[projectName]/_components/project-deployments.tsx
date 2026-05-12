"use client"

import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { GitBranch, Loader2, PlayCircle, RefreshCw, CheckCircle2, XCircle, Clock, MoreHorizontal, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Deployment {
  id: string
  status: string
  createdAt: string
  finishedAt?: string
}

interface Project {
  name?: string
  deployments?: Deployment[]
}

export function ProjectDeployments({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': 
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 py-0.5 px-2 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </Badge>
        )
      case 'FAILED': 
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 gap-1.5 py-0.5 px-2 font-medium">
            <XCircle className="h-3.5 w-3.5" />
            Error
          </Badge>
        )
      case 'BUILDING': 
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1.5 py-0.5 px-2 font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Building
          </Badge>
        )
      case 'QUEUED': 
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 gap-1.5 py-0.5 px-2 font-medium">
            <Clock className="h-3.5 w-3.5" />
            Queued
          </Badge>
        )
      default: 
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20 gap-1.5 py-0.5 px-2 font-medium">
            <Clock className="h-3.5 w-3.5" />
            Unknown
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Deployment History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and monitor all previous deployments for this project.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2 transition-all hover:bg-secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border bg-background/60 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deployment
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Branch
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Environment
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </TableHead>
              <TableHead className="w-[56px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.deployments?.map((deployment: Deployment) => {
              const createdAt = deployment.createdAt
              const createdLabel = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

              return (
                <TableRow
                  key={deployment.id}
                  className="transition-colors hover:bg-muted/10 group"
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-sm font-semibold">
                        {deployment.id.substring(0, 8)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {getStatusBadge(deployment.status)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">main</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-medium">Production</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex flex-col">
                      <span>{createdLabel}</span>
                      {deployment.finishedAt && (
                        <span className="text-xs opacity-70">
                          in {Math.max(1, Math.round((new Date(deployment.finishedAt).getTime() - new Date(deployment.createdAt).getTime()) / 1000))}s
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.name || "project"}/deployments/${deployment.id}`} className="gap-2 cursor-pointer">
                            <PlayCircle className="h-4 w-4" />
                            View Logs
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.name || "project"}`} className="gap-2 cursor-pointer">
                            <ExternalLink className="h-4 w-4" />
                            View Project
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {(!project.deployments || project.deployments.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>No deployments found for this project.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
