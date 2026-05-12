"use client"

import { Globe, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DomainsEmptyStateProps {
  onAdd: () => void
}

export function DomainsEmptyState({ onAdd }: DomainsEmptyStateProps) {
  return (
    <Card className="border-dashed bg-background/60 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="rounded-full bg-muted p-4">
          <Globe className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">No domains found</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            Connect a custom domain to your project to make it accessible via your own URL.
          </p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </CardContent>
    </Card>
  )
}
