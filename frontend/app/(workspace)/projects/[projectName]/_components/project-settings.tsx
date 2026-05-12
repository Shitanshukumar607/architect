"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Globe, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface Domain {
  id: string
  hostname: string
  verified: boolean
}

interface EnvVar {
  id: string
  key: string
  value: string
}

interface Project {
  framework: string
  buildCommand: string
  outputDir: string
  domains?: Domain[]
  envVars?: EnvVar[]
}

export function ProjectSettings({
  project,
}: {
  project: Project
  onRefresh: () => void
}) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
      <div className="w-full shrink-0 md:w-64">
        <div className="flex flex-col gap-1 rounded-lg border bg-card p-2 text-sm shadow-sm">
          <Button
            variant={activeTab === "general" ? "secondary" : "ghost"}
            className="justify-start font-medium"
            size="sm"
            onClick={() => setActiveTab("general")}
          >
            General
          </Button>
          <Button
            variant={activeTab === "domains" ? "secondary" : "ghost"}
            className="justify-start font-medium"
            size="sm"
            onClick={() => setActiveTab("domains")}
          >
            Domains
          </Button>
          <Button
            variant={activeTab === "envVars" ? "secondary" : "ghost"}
            className="justify-start font-medium"
            size="sm"
            onClick={() => setActiveTab("envVars")}
          >
            Environment Variables
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {activeTab === "general" && (
          <div className="animate-in space-y-6 fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Build & Development Settings</CardTitle>
                <CardDescription>
                  When using a framework, these settings are automatically
                  detected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Framework Preset</Label>
                  <Input
                    value={project.framework}
                    readOnly
                    disabled
                    className="max-w-md capitalize"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Build Command</Label>
                  <Input
                    defaultValue={project.buildCommand || ""}
                    className="max-w-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Output Directory</Label>
                  <Input
                    defaultValue={project.outputDir || "dist"}
                    className="max-w-md"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t bg-muted/50 px-6 py-4">
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Delete Project
                </CardTitle>
                <CardDescription>
                  The project will be permanently deleted, including its
                  deployments and domains. This action is irreversible and can
                  not be undone.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end border-t border-destructive/10 bg-destructive/5 px-6 py-4">
                <Button variant="destructive">Delete Project</Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "domains" && (
          <div className="animate-in space-y-6 fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Domains</CardTitle>
                <CardDescription>
                  Manage domains for your project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex max-w-md gap-2">
                  <Input placeholder="mywebsite.com" />
                  <Button>Add</Button>
                </div>

                <div className="space-y-4">
                  {project.domains?.map((domain: Domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2 font-semibold">
                            {domain.hostname}
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                              {domain.verified ? "Valid" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(project.domains?.length ?? 0) === 0 && (
                    <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                      No domains configured yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "envVars" && (
          <div className="animate-in space-y-6 fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>
                  In order to provide your Deployment with Environment Variables
                  at Build and Runtime, you may enter them right here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Key</Label>
                      <Input placeholder="API_URL" />
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input placeholder="https://api.example.com" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" /> Add Variable
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  {(project.envVars?.length ?? 0) > 0 ? (
                    <div className="divide-y">
                      {project.envVars?.map((env: EnvVar) => (
                        <div
                          key={env.id}
                          className="flex items-center justify-between bg-muted/20 p-4"
                        >
                          <div className="flex w-full max-w-50 flex-col gap-1 overflow-hidden">
                            <span className="truncate font-mono text-sm font-semibold">
                              {env.key}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col gap-1 overflow-hidden px-4">
                            <span className="truncate font-mono text-sm text-muted-foreground">
                              {env.value}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-38 items-center justify-center bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                      No environment variables configured.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
