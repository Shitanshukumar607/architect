"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Globe, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DomainsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Domains
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Manage your custom domains and SSL certificates.
          </p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Domain
        </Button>
      </div>

      <Card className="border-dashed bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No domains yet</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Add a custom domain to your projects to make them accessible via your own branded URLs.
          </p>
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
