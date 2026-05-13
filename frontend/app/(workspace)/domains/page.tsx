"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronRight, FolderGit2, Globe, Loader2, Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useProjects } from "@/lib/queries"
import { Project } from "@/lib/types"

export default function DomainsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProjects = projects.filter((project: Project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          Domains
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          Select a project to manage its custom domains and SSL certificates.
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
        <Card className="border-dashed bg-background/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
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
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.name}/domains`}
                className="group"
              >
                <Card className="overflow-hidden bg-background/50 transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20 transition-all group-hover:scale-110 group-hover:bg-primary/20">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                          {project.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {project.framework || "Other"} Project
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="hidden rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary sm:flex"
                      >
                        Click to manage
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg text-muted-foreground">
                No projects found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
