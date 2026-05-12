"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, Loader2, PlayCircle, Clock, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow, format } from "date-fns"

interface DeploymentLog {
  id: string
  level: string
  message: string
  timestamp: string
}

interface Deployment {
  id: string
  status: string
  createdAt: string
  finishedAt?: string
  buildCommand: string
  repoUrl: string
  logs: DeploymentLog[]
}

export default function DeploymentLogsPage() {
  const params = useParams()
  const router = useRouter()
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDeployment = useCallback(async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(
        `${baseUrl}/api/deploy/${params.deploymentId}`,
        {
          credentials: "include",
        }
      )
      if (response.ok) {
        const data = await response.json()
        setDeployment(data)
      } else {
        router.push(`/projects/${params.projectName}/deployments`)
      }
    } catch (error) {
      console.error("Failed to fetch deployment logs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [params.deploymentId, params.projectName, router])

  useEffect(() => {
    if (params.deploymentId) {
      fetchDeployment()

      // Setup polling if deployment is in progress
      const interval = setInterval(() => {
        setDeployment((prev) => {
          if (
            prev &&
            (prev.status === "QUEUED" || prev.status === "BUILDING")
          ) {
            fetchDeployment()
          }
          return prev
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [params.deploymentId, fetchDeployment])

  if (isLoading && !deployment) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!deployment) return null

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-7 p-5 duration-500 fade-in md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Deployment logs
            </h1>
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
          <p className="text-sm text-muted-foreground">
            Deployment #{deployment.id} for {params.projectName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="border-b bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 font-mono text-sm">
              <PlayCircle className="h-4 w-4" />
              Build Output
            </div>
          </CardHeader>
          <CardContent className="flex-1 bg-black p-0">
            <div className="h-[600px] overflow-y-auto p-4 font-mono text-sm text-gray-300">
              {deployment.logs && deployment.logs.length > 0 ? (
                deployment.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex gap-4 rounded px-2 py-0.5 hover:bg-white/5"
                  >
                    <span className="shrink-0 text-gray-500">
                      {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                    </span>
                    <span
                      className={
                        log.level === "error" ? "text-red-400" : "text-gray-300"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                  {deployment.status === "QUEUED" ||
                  deployment.status === "BUILDING" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Waiting for logs...
                    </>
                  ) : (
                    "No logs available."
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="grid gap-1">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{deployment.status}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-muted-foreground">Created</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDistanceToNow(new Date(deployment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {deployment.finishedAt && (
                <div className="grid gap-1">
                  <span className="text-muted-foreground">Finished</span>
                  <span className="font-medium">
                    {format(new Date(deployment.finishedAt), "PPpp")}
                  </span>
                </div>
              )}
              <div className="grid gap-1">
                <span className="text-muted-foreground">Branch</span>
                <span className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                  main
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
