"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Project } from "@/lib/types"
import { getDomain } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import {
  Clock,
  ExternalLink,
  GitBranch,
  LayoutTemplate,
  FolderGit2,
  Plus,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProjectListProps {
  projects: Project[]
  onCreateClick: () => void
}

export function ProjectList({ projects, onCreateClick }: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background/50 shadow-sm backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="py-4 pl-6 font-bold text-foreground">
              Project
            </TableHead>
            <TableHead className="py-4 font-bold text-foreground">
              Branch
            </TableHead>
            <TableHead className="py-4 text-center font-bold text-foreground">
              Framework
            </TableHead>
            <TableHead className="py-4 text-center font-bold text-foreground">
              Auto Deploy
            </TableHead>
            <TableHead className="py-4 text-right font-bold text-foreground">
              Last Deployed
            </TableHead>
            <TableHead className="w-[50px] py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProjectRow({ project }: { project: Project }) {
  return (
    <TableRow className="group border-border/50 transition-colors hover:bg-muted/20">
      <TableCell className="py-4 pl-6">
        <div className="flex max-w-[240px] flex-col gap-1.5 lg:max-w-[320px]">
          <div className="flex items-center gap-2">
            <Link
              href={`/projects/${project.name}`}
              className="text-[15px] font-bold transition-colors hover:text-primary"
            >
              {project.name}
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              {project.domains && project.domains.length > 0 && (
                <a
                  href={`https://${getDomain(project.domains[0].hostname)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-primary"
                  title="Visit Site"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-primary"
                  title="View on GitHub"
                >
                  <Image
                    src="/github.svg"
                    alt="GitHub"
                    width={16}
                    height={16}
                    className="brightness-0 dark:invert"
                  />
                </a>
              )}
            </div>
          </div>
          {project.rootDirectory && project.rootDirectory !== "/" && (
            <div className="flex w-fit items-center gap-1.5 rounded-md bg-muted/30 px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground/80">
              <LayoutTemplate className="h-3 w-3" />
              <span>{project.rootDirectory}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
          <GitBranch className="h-3.5 w-3.5 opacity-50" />
          {project.branch || "main"}
        </div>
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="rounded-lg bg-muted/40 px-2.5 py-1 text-xs font-semibold"
          >
            {project.framework === "other"
              ? "Custom"
              : project.framework || "Static"}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="flex justify-center">
          {project.autoDeploy ? (
            <Badge
              variant="outline"
              className="gap-1.5 border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
            >
              Active
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground/60"
            >
              Disabled
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 text-right">
        <div className="flex items-center justify-end gap-2 text-sm font-medium text-muted-foreground/70">
          <Clock className="h-3.5 w-3.5 opacity-50" />
          <span className="whitespace-nowrap">
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="border-dashed bg-background/50 backdrop-blur-sm">
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <FolderGit2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
        <p className="mb-6 max-w-sm text-muted-foreground">
          Create your first project to start deploying your applications to our
          global edge network.
        </p>
        <Button onClick={onCreateClick} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </CardContent>
    </Card>
  )
}
