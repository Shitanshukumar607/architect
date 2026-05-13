"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import {
  Clock,
  ExternalLink,
  GitBranch,
  Globe,
  LayoutTemplate,
  Loader2,
  Terminal,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ProjectDeployments } from "./_components/project-deployments"
import { ProjectSettings } from "./_components/project-settings"
import { useProject } from "@/lib/queries"

// Removed unused type imports

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useProject(params.projectName as string)

  useEffect(() => {
    if (isError && (error as Error)?.message === "Failed to fetch project") {
      router.push("/projects")
    }
  }, [isError, error, router])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  const latestDeployment = project.deployments?.[0]

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Image
                  src="/github.svg"
                  alt="GitHub"
                  width={14}
                  height={14}
                  className="brightness-0 dark:invert"
                />
                {project.repoUrl.replace("https://github.com/", "")}
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <LayoutTemplate className="h-4 w-4" />
              <span className="capitalize">{project.framework}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Created{" "}
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {project.domains?.[0] && (
            <Button asChild variant="outline" className="gap-2">
              <a
                href={`http://${project.domains[0].hostname}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="overview"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="domains"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Domains
          </TabsTrigger>
          <TabsTrigger
            value="env-vars"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Environment Variables
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pt-2 pb-3 font-medium text-muted-foreground data-[state=active]:border-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Latest Deployment Info */}
            <Card className="col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle>Production Deployment</CardTitle>
                <CardDescription>
                  The deployment that is currently live.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestDeployment ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {project.domains?.[0]?.hostname || "Not assigned"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" /> main
                          </span>
                          <span>
                            {formatDistanceToNow(
                              new Date(latestDeployment.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          latestDeployment.status === "SUCCESS"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {latestDeployment.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No deployments found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Domains Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>
                  Domains assigned to this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.domains?.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {domain.hostname}
                        </span>
                      </div>
                      {domain.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="mt-6">
          <ProjectDeployments project={project} onRefresh={refetch} />
        </TabsContent>

        <TabsContent value="domains" className="mt-6">
          <Card className="border-dashed bg-background/50">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Globe className="mb-4 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Manage Domains</h3>
              <p className="mb-4 text-muted-foreground">
                View and configure domains for this project.
              </p>
              <Button asChild variant="outline">
                <Link href={`/projects/${params.projectName}/domains`}>
                  Go to Domains Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env-vars" className="mt-6">
          <Card className="border-dashed bg-background/50">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <Terminal className="mb-4 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Environment Variables</h3>
              <p className="mb-4 text-muted-foreground">
                Configure variables for your application.
              </p>
              <Button asChild variant="outline">
                <Link
                  href={`/projects/${params.projectName}/environment-variables`}
                >
                  Go to Env Vars Page
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProjectSettings project={project} onRefresh={refetch} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
