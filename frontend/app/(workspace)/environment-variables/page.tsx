"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EnvVarsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-8 p-4 duration-500 fade-in md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            Environment Variables
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Configure environment-specific variables for your applications.
          </p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Variable
        </Button>
      </div>

      <Card className="border-dashed bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No environment variables</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Securely store API keys, secrets, and configuration values that your apps can access at runtime.
          </p>
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Variable
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
