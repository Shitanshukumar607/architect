"use client"

import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EnvVarsSharedStateProps {
  onLinkShared: () => void
}

export function EnvVarsSharedState({ onLinkShared }: EnvVarsSharedStateProps) {
  return (
    <Card className="border-dashed bg-background/60">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-semibold">Shared variables</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Share variables across projects and environments. This feature is
          coming soon.
        </p>
        <Button variant="outline" className="gap-2" onClick={onLinkShared}>
          <Link2 className="h-4 w-4" />
          Link Shared Variable
        </Button>
      </CardContent>
    </Card>
  )
}
