"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function Page() {
  const [repoUrl, setRepoUrl] = useState("")
  const [framework, setFramework] = useState("vite")
  const [isLoading, setIsLoading] = useState(false)

  const handleDeploy = async () => {
    if (!repoUrl) {
      toast.error("Please enter a repository URL")
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Queuing deployment...")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deploy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          // Map framework to default build commands if needed
          buildCommand: framework === "vite" ? "npm run build" : "",
          outputDir: framework === "vite" ? "dist" : ".",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to queue deployment")
      }

      toast.success("Deployment queued successfully!", {
        id: toastId,
        description: `Deployment ID: ${data.deployment.id}`,
      })
      
      setRepoUrl("")
    } catch (error: any) {
      toast.error(error.message || "An error occurred", {
        id: toastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm rounded-lg border-border shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">Deploy Project</CardTitle>
          <CardDescription>
            Enter your frontend repository details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input 
              id="repo-url" 
              placeholder="https://github.com/user/repo" 
              className="h-10 border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="framework">Framework</Label>
            <Select 
              value={framework} 
              onValueChange={setFramework}
              disabled={isLoading}
            >
              <SelectTrigger id="framework" className="h-10 border-input bg-background px-3 focus:ring-1 focus:ring-ring">
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover shadow-md p-1">
                <SelectItem value="vite">Vite</SelectItem>
                <SelectItem value="static">Static HTML/CSS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              Note
            </Badge>
            <span className="text-xs text-muted-foreground">
              We only support Vite and Static HTML/CSS.
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-medium" 
            onClick={handleDeploy}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              "Deploy"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
