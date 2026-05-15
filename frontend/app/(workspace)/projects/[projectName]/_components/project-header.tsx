"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProject } from "@/lib/queries"
import { getDomain } from "@/lib/utils"
import { ExternalLink, Globe, LayoutTemplate } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"

export function ProjectHeader() {
  const params = useParams()
  const projectName = params.projectName as string
  const { data: project } = useProject(projectName)

  if (!project) return null

  const primaryDomain = project.domains?.[0]?.hostname

  return (
    <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] h-5 px-1.5"
            >
              Active
            </Badge>
            <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground border-l pl-4">
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
                    width={12}
                    height={12}
                    className="brightness-0 dark:invert"
                  />
                  {project.repoUrl.replace("https://github.com/", "")}
                </a>
              )}
              {primaryDomain && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <a
                    href={`https://${getDomain(primaryDomain)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {getDomain(primaryDomain)}
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {primaryDomain && (
              <Button asChild variant="outline" size="xs" className="h-7 gap-1.5 text-[11px] px-2.5 shadow-sm">
                <a
                  href={`https://${getDomain(primaryDomain)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
