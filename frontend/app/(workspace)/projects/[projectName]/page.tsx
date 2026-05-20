"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDeployProject, useProject } from "@/lib/queries"
import { formatDistanceToNow } from "date-fns"
import {
  ExternalLink,
  GitBranch,
  Globe,
  Loader2,
  Plus,
  Rocket,
  Settings,
  Terminal,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { use } from "react"

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{
    projectName: string
  }>
}) {
  const { projectName } = use(params)
  const { data: project, isLoading, refetch } = useProject(projectName)

  const { mutate: deploy, isPending: isDeploying } = useDeployProject()

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

  const deployments = project.deployments || []
  const domains = project.domains || []

  const handleRedeploy = () => {
    deploy(
      {
        repoUrl: project.repoUrl,
        buildCommand: project.buildCommand,
        outputDir: project.outputDir,
      },
      {
        onSuccess: () => refetch(),
      }
    )
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
        )
      case "FAILED":
        return (
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
        )
      case "BUILDING":
        return <Loader2 className="h-2 w-2 animate-spin text-blue-500" />
      default:
        return <div className="h-2 w-2 rounded-full bg-gray-400" />
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 p-6 md:p-10">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {project.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
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
            <span className="flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5" /> {project.branch || "main"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {domains[0] && (
            <Button asChild variant="outline" className="h-9 px-4">
              <a
                href={`https://${domains[0].hostname}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Site <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button
            onClick={handleRedeploy}
            disabled={isDeploying}
            className="h-9 px-4 shadow-md"
          >
            {isDeploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            Redeploy
          </Button>
        </div>
      </div>

      {/* Deployments Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Deployments</h2>
          <Button
            variant="link"
            size="sm"
            asChild
            className="h-auto p-0 font-bold"
          >
            <Link href={`/projects/${project.name}/deployments`}>View All</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border bg-background/50">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 font-bold">ID</TableHead>
                <TableHead className="h-10 font-bold">Status</TableHead>
                <TableHead className="h-10 font-bold">Environment</TableHead>
                <TableHead className="h-10 text-right font-bold">
                  Created
                </TableHead>
                <TableHead className="h-10 w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.slice(0, 3).map((deployment) => (
                <TableRow
                  key={deployment.id}
                  className="group hover:bg-muted/20"
                >
                  <TableCell className="py-3 font-mono text-xs font-semibold">
                    {deployment.id.substring(0, 8)}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-tight uppercase">
                      {getStatusDot(deployment.status)}
                      {deployment.status}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-medium">
                    Production
                  </TableCell>
                  <TableCell className="py-3 text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(deployment.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        href={`/projects/${project.name}/deployments/${deployment.id}`}
                      >
                        <Terminal className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Domains Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Domains</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs"
            asChild
          >
            <Link href={`/projects/${project.name}/domains`}>
              <Plus className="mr-1.5 h-3 w-3" /> Add
            </Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border bg-background/50">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 font-bold">Hostname</TableHead>
                <TableHead className="h-10 font-bold">Status</TableHead>
                <TableHead className="h-10 text-right font-bold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id} className="hover:bg-muted/20">
                  <TableCell className="py-3 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      {domain.hostname}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {domain.verified ? (
                      <Badge
                        variant="secondary"
                        className="h-5 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 text-[10px]">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {domains.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No domains configured.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Settings Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold">Project Settings</h2>
          <Button variant="ghost" size="sm" asChild className="h-auto p-0">
            <Link href={`/projects/${project.name}/settings`}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1.5 p-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Build Command
            </p>
            <code className="block truncate rounded bg-muted/50 px-2 py-1 font-mono text-xs">
              {project.buildCommand || "npm run build"}
            </code>
          </div>
          <div className="space-y-1.5 p-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Output Directory
            </p>
            <p className="text-sm font-semibold">
              {project.outputDir || "dist"}
            </p>
          </div>
          <div className="space-y-1.5 p-1">
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Framework
            </p>
            <p className="text-sm font-semibold capitalize">
              {project.framework}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
