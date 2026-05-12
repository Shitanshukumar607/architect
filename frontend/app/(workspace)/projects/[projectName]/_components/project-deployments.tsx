"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { formatDistanceToNow, format } from "date-fns"
import { GitBranch, Globe, Loader2, PlayCircle, RefreshCw } from "lucide-react"

interface Deployment {
  id: string
  status: string
  createdAt: string
  finishedAt?: string
}

interface Project {
  deployments?: Deployment[]
}

export function ProjectDeployments({
  project,
  onRefresh,
}: {
  project: Project
  onRefresh: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deployment History</h2>
          <p className="text-sm text-muted-foreground">
            View all previous deployments for this project.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {project.deployments?.map((deployment: Deployment) => (
          <Card key={deployment.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex flex-1 flex-col gap-2 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">
                      #{deployment.id.substring(0, 8)}
                    </span>
                    <Badge
                      variant={
                        deployment.status === "SUCCESS"
                          ? "default"
                          : deployment.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {deployment.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4" />
                      <span className="font-medium">main</span>
                    </div>
                    {deployment.status === "SUCCESS" && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Globe className="h-4 w-4" />
                        <span className="font-medium">Production</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between gap-4 border-t bg-muted/50 p-4 text-sm sm:w-64 sm:flex-col sm:items-end sm:border-t-0 sm:border-l sm:p-6">
                  <div className="flex flex-col gap-1 sm:text-right">
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(deployment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {deployment.finishedAt && (
                      <span className="text-xs text-muted-foreground">
                        Completed at{" "}
                        {format(new Date(deployment.finishedAt), "HH:mm:ss")}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!project.deployments?.length && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
            <h3 className="text-lg font-medium">No deployments yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Deployments will appear here once you push code to your linked
              repository or trigger a manual deployment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
