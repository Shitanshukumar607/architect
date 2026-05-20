"use client"

// Removed unused useState
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import {
  GitBranch,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Rocket,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDeployProject } from "@/lib/queries"

import { Project, Deployment } from "@/lib/types"

export function ProjectDeployments({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  const router = useRouter()
  const { mutate: deploy, isPending: isDeploying } = useDeployProject()

  const handleRedeploy = () => {
    deploy(
      {
        repoUrl: project.repoUrl,
        buildCommand: project.buildCommand,
        outputDir: project.outputDir,
      },
      {
        onSuccess: () => onRefresh(),
        onError: (error) => console.error("Failed to redeploy:", error),
      }
    )
  }

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

  return (
    <div className="flex animate-in flex-col gap-6 duration-500 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Deployment History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View and monitor all previous deployments for this project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRedeploy}
            disabled={isDeploying || !project.repoUrl}
            className="gap-2 shadow-sm transition-all"
          >
            {isDeploying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Redeploy
          </Button>
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
      </div>

      <div className="rounded-xl border bg-background/60 shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Deployment
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Branch
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Environment
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Created
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.deployments?.map((deployment: Deployment) => {
              const createdAt = deployment.createdAt
              const createdLabel = formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
              })
              const deploymentHref = `/projects/${project.name || "project"}/deployments/${deployment.id}`

              return (
                <TableRow
                  key={deployment.id}
                  className="group cursor-pointer transition-colors hover:bg-muted/10"
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(deploymentHref)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      router.push(deploymentHref)
                    }
                  }}
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={deploymentHref}
                        className="font-mono text-sm font-semibold hover:underline"
                      >
                        {deployment.id.substring(0, 8)}
                      </Link>
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
                          in{" "}
                          {Math.max(
                            1,
                            Math.round(
                              (new Date(deployment.finishedAt).getTime() -
                                new Date(deployment.createdAt).getTime()) /
                                1000
                            )
                          )}
                          s
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {(!project.deployments || project.deployments.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
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
