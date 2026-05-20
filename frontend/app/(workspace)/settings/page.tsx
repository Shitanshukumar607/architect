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
import { useProjects } from "@/lib/queries"
import { Project } from "@/lib/types"
import { FolderGit2, Loader2, Search, Settings2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SettingsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          Settings
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          View and manage general configurations across all your projects.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
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
            You need to create a project before you can manage its settings.
          </p>
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/projects">Create Project</Link>
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background/50 py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </p>
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
                  Configuration Overview
                </TableHead>
                <TableHead className="w-[100px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="group transition-colors hover:bg-muted/10"
                >
                  <TableCell className="px-4 py-4 align-top font-medium">
                    <Link
                      href={`/projects/${project.name}`}
                      className="transition-colors hover:text-primary hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top">
                    <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                          Framework
                        </span>
                        <span className="font-medium text-foreground">
                          {project.framework || "None"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                          Build Command
                        </span>
                        <code className="w-fit rounded-md border bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
                          {project.buildCommand || "None"}
                        </code>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                          Output Directory
                        </span>
                        <code className="w-fit rounded-md border bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-foreground">
                          {project.outputDir || "None"}
                        </code>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold tracking-wider uppercase">
                          Auto Deploy
                        </span>
                        <span className="text-foreground">
                          {project.autoDeploy ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right align-top">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="-mt-1.5 gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Link href={`/projects/${project.name}/settings`}>
                        <Settings2 className="h-3 w-3" /> Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
