"use client"

import { useParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

import { DomainsFilters } from "./_components/domains-filters"
import { DomainsHeader } from "./_components/domains-header"
import { DomainsTable } from "./_components/domains-table"
import { DomainsEmptyState } from "./_components/domains-empty-state"
import { DomainsAddDialog } from "./_components/domains-add-dialog"
import { DomainsEditDialog } from "./_components/domains-edit-dialog"
import type { Domain, Project } from "./_components/domains.types"

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json()
    if (data?.error) {
      return data.error as string
    }
  } catch {
    // ignore
  }
  return fallback
}

export default function ProjectDomainsPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [newDomain, setNewDomain] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [editHostname, setEditHostname] = useState("")
  const [isUpdatingDomain, setIsUpdatingDomain] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${baseUrl}/api/projects/name/${params.projectName}`,
        {
          credentials: "include",
        }
      )
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("Failed to load project domains")
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl, params.projectName])

  const handleAddDomain = async () => {
    const trimmedHostname = newDomain.trim()
    if (!trimmedHostname) {
      toast.error("Hostname is required")
      return
    }

    try {
      setIsAddingDomain(true)
      const response = await fetch(
        `${baseUrl}/api/projects/name/${params.projectName}/domains`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostname: trimmedHostname }),
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Domain added successfully")
        setNewDomain("")
        setIsAddOpen(false)
        fetchProject()
      } else {
        toast.error(await getErrorMessage(response, "Failed to add domain"))
      }
    } catch {
      toast.error("An error occurred while adding the domain")
    } finally {
      setIsAddingDomain(false)
    }
  }

  const handleUpdateDomain = async () => {
    if (!editingDomain) return
    const trimmedHostname = editHostname.trim()

    if (!trimmedHostname) {
      toast.error("Hostname is required")
      return
    }

    if (trimmedHostname === editingDomain.hostname) {
      toast.message("No changes to save")
      return
    }

    try {
      setIsUpdatingDomain(true)
      const response = await fetch(
        `${baseUrl}/api/projects/name/${params.projectName}/domains/${editingDomain.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hostname: trimmedHostname }),
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Domain updated successfully")
        setEditingDomain(null)
        setEditHostname("")
        fetchProject()
      } else {
        toast.error(await getErrorMessage(response, "Failed to update domain"))
      }
    } catch {
      toast.error("An error occurred while updating the domain")
    } finally {
      setIsUpdatingDomain(false)
    }
  }

  const handleCopyDomain = async (hostname: string) => {
    try {
      await navigator.clipboard.writeText(hostname)
      toast.success("Domain copied to clipboard")
    } catch (error) {
      console.error("Copy domain error:", error)
      toast.error("Failed to copy domain")
    }
  }

  useEffect(() => {
    if (params.projectName) {
      fetchProject()
    }
  }, [params.projectName, fetchProject])

  useEffect(() => {
    if (editingDomain) {
      setEditHostname(editingDomain.hostname)
    }
  }, [editingDomain])

  const filteredDomains = useMemo(() => {
    const list = project?.domains ?? []
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return list
    }

    return list.filter((domain) =>
      domain.hostname.toLowerCase().includes(query)
    )
  }, [project, searchQuery])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-5 md:p-8">
      <DomainsHeader
        actions={
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Domain
          </Button>
        }
      />

      <Tabs defaultValue="all" className="w-full">
        <TabsList variant="line">
          <TabsTrigger value="all">All Domains</TabsTrigger>
          <TabsTrigger value="checklist">Setup Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          <DomainsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {filteredDomains.length === 0 ? (
            <DomainsEmptyState onAdd={() => setIsAddOpen(true)} />
          ) : (
            <DomainsTable
              items={filteredDomains}
              onEdit={setEditingDomain}
              onCopy={handleCopyDomain}
            />
          )}
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card className="bg-background/60 shadow-sm">
            <CardHeader>
              <CardTitle>Setup Checklist</CardTitle>
              <CardDescription>
                Follow these steps to verify your custom domain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  title: "Add a DNS record",
                  description:
                    "Create a CNAME or A record with your DNS provider that points to our servers. You can find the target in your project settings.",
                },
                {
                  title: "Wait for propagation",
                  description:
                    "DNS changes can take anywhere from a few minutes to 24 hours to propagate globally. We'll keep checking the status automatically.",
                },
                {
                  title: "Verify and Go Live",
                  description:
                    "Once the records are detected, your domain will be marked as verified and will start serving your project immediately.",
                },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted/50 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold leading-none">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DomainsAddDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddDomain}
        isLoading={isAddingDomain}
        newDomain={newDomain}
        onDomainChange={setNewDomain}
        isDisabled={isAddingDomain || newDomain.trim().length === 0}
      />

      <DomainsEditDialog
        open={Boolean(editingDomain)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDomain(null)
            setEditHostname("")
          }
        }}
        onSubmit={handleUpdateDomain}
        isLoading={isUpdatingDomain}
        editHostname={editHostname}
        onHostnameChange={setEditHostname}
        isDisabled={isUpdatingDomain || editHostname.trim().length === 0}
      />
    </div>
  )
}
