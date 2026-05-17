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
import { ChevronRight, FolderGit2, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useProjects } from "@/lib/queries"
import { Project } from "@/lib/types"
import { getDomain } from "@/lib/utils"

export default function DomainsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.domains?.some(d => d.hostname.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          Domains
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          View and manage custom domains across all your projects.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects or domains..."
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
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-background/50">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <FolderGit2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects yet</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            You need to create a project before you can manage its domains.
          </p>
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/projects">Create Project</Link>
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed bg-background/50">
          <p className="text-lg text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-background/60 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[250px]">
                  Project
                </TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Domains
                </TableHead>
                <TableHead className="w-[100px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const hasDomains = project.domains && project.domains.length > 0;
                
                return (
                  <TableRow key={project.id} className="transition-colors hover:bg-muted/10 group">
                    <TableCell className="px-4 py-4 font-medium align-top">
                      <Link href={`/projects/${project.name}`} className="hover:text-primary transition-colors hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-4 align-top">
                      {!hasDomains ? (
                        <span className="text-muted-foreground text-sm italic">
                          No domains configured
                        </span>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {project.domains.map((domain) => (
                            <div key={domain.id} className="flex items-center gap-3">
                              <a
                                href={`https://${getDomain(domain.hostname)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors hover:underline font-medium"
                              >
                                {getDomain(domain.hostname)}
                              </a>
                              <Badge
                                variant={domain.verified ? "default" : "secondary"}
                                className="rounded-full px-2 py-0 text-[10px] uppercase font-bold"
                              >
                                {domain.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right align-top">
                      <Button variant="ghost" size="sm" asChild className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-1.5">
                        <Link href={`/projects/${project.name}/domains`}>
                          Manage <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
