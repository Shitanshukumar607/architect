"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EnvVarsEmptyStateProps {
  onAdd: () => void
}

export function EnvVarsEmptyState({ onAdd }: EnvVarsEmptyStateProps) {
  return (
    <Card className="border-dashed bg-background/60">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-semibold">No environment variables</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add your first environment variable to configure this project.
        </p>
        <Button className="gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Environment Variable
        </Button>
      </CardContent>
    </Card>
  )
}
