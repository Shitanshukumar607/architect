"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, LayoutGrid } from "lucide-react"

interface ProjectSelectionRequiredProps {
  featureName: string
  description: string
  icon: React.ElementType
}

export function ProjectSelectionRequired({
  featureName,
  description,
  icon: Icon,
}: ProjectSelectionRequiredProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          {featureName}
        </h1>
        <p className="text-lg font-medium text-muted-foreground">
          {description}
        </p>
      </div>

      <Card className="border-dashed bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-6 rounded-2xl bg-primary/10 p-5 ring-1 ring-primary/20">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-3 text-2xl font-bold tracking-tight">Project Selection Required</h3>
          <p className="mb-8 max-w-md text-balance text-lg text-muted-foreground">
            To view and manage {featureName.toLowerCase()}, you must first select a project from your dashboard.
          </p>
          <Button asChild size="lg" className="gap-2 rounded-xl px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Link href="/projects">
              <LayoutGrid className="h-4 w-4" />
              Go to Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
