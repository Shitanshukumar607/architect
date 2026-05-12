"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Link2, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { EnvVarsAddDialog } from "./_components/env-vars-add-dialog"
import { EnvVarsEditDialog } from "./_components/env-vars-edit-dialog"
import { EnvVarsEmptyState } from "./_components/env-vars-empty-state"
import { EnvVarsFilters } from "./_components/env-vars-filters"
import { EnvVarsHeader } from "./_components/env-vars-header"
import { EnvVarsSharedState } from "./_components/env-vars-shared-state"
import { EnvVarsTable } from "./_components/env-vars-table"
import type { EnvVar, Project } from "./_components/env-vars.types"

const MASKED_VALUE = "••••••••"

function getProjectName(
  value: string | string[] | undefined
): string | undefined {
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}

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

export default function ProjectEnvVarsPage() {
  const params = useParams()
  const router = useRouter()
  const projectName = getProjectName(
    params.projectName as string | string[] | undefined
  )

  const [project, setProject] = useState<Project | null>(null)
  const [envVars, setEnvVars] = useState<EnvVar[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [environmentFilter, setEnvironmentFilter] = useState("all")
  const [editorFilter, setEditorFilter] = useState("all")
  const [variableFilter, setVariableFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updated")

  const [revealedValues, setRevealedValues] = useState<Record<string, boolean>>(
    {}
  )

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAddLoading, setIsAddLoading] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const [editingVar, setEditingVar] = useState<EnvVar | null>(null)
  const [editKey, setEditKey] = useState("")
  const [editValue, setEditValue] = useState("")
  const [isEditLoading, setIsEditLoading] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const fetchProject = async () => {
    if (!projectName) return
    const response = await fetch(
      `${baseUrl}/api/projects/name/${projectName}`,
      {
        credentials: "include",
      }
    )

    if (response.ok) {
      const data = await response.json()
      setProject(data)
      return
    }

    if (response.status === 404) {
      router.push("/projects")
      return
    }

    toast.error(await getErrorMessage(response, "Failed to load project"))
  }

  const fetchEnvVars = async () => {
    if (!projectName) return
    const response = await fetch(
      `${baseUrl}/api/projects/name/${projectName}/env-vars`,
      {
        credentials: "include",
      }
    )

    if (response.ok) {
      const data = await response.json()
      setEnvVars(data)
      return
    }

    toast.error(await getErrorMessage(response, "Failed to load variables"))
  }

  const loadData = async () => {
    if (!projectName) return
    setIsLoading(true)
    try {
      await Promise.all([fetchProject(), fetchEnvVars()])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (projectName) {
      loadData()
    }
  }, [projectName])

  useEffect(() => {
    if (editingVar) {
      setEditKey(editingVar.key)
      setEditValue(editingVar.value)
    }
  }, [editingVar])

  const filteredVars = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let items = envVars

    if (query) {
      items = items.filter((envVar) => envVar.key.toLowerCase().includes(query))
    }

    if (sortBy === "name") {
      items = [...items].sort((a, b) => a.key.localeCompare(b.key))
    } else {
      items = [...items].sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt).getTime()
        const bDate = new Date(b.updatedAt || b.createdAt).getTime()
        return bDate - aDate
      })
    }

    return items
  }, [envVars, searchQuery, sortBy])

  const handleAddVar = async () => {
    if (!projectName) return
    const trimmedKey = newKey.trim()
    const trimmedValue = newValue.trim()

    if (!trimmedKey || !trimmedValue) {
      toast.error("Key and value are required")
      return
    }

    setIsAddLoading(true)
    try {
      const response = await fetch(
        `${baseUrl}/api/projects/name/${projectName}/env-vars`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: trimmedKey, value: trimmedValue }),
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Variable added successfully")
        setNewKey("")
        setNewValue("")
        setIsAddOpen(false)
        await fetchEnvVars()
      } else {
        toast.error(await getErrorMessage(response, "Failed to add variable"))
      }
    } catch (error) {
      console.error("Add env var error:", error)
      toast.error("An error occurred while adding the variable")
    } finally {
      setIsAddLoading(false)
    }
  }

  const handleEditVar = async () => {
    if (!projectName || !editingVar) return
    const trimmedKey = editKey.trim()
    const trimmedValue = editValue.trim()

    if (!trimmedKey || !trimmedValue) {
      toast.error("Key and value are required")
      return
    }

    if (trimmedKey === editingVar.key && trimmedValue === editingVar.value) {
      toast.message("No changes to save")
      return
    }

    setIsEditLoading(true)
    try {
      const response = await fetch(
        `${baseUrl}/api/projects/name/${projectName}/env-vars/${editingVar.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: trimmedKey, value: trimmedValue }),
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Variable updated successfully")
        setEditingVar(null)
        await fetchEnvVars()
      } else {
        toast.error(
          await getErrorMessage(response, "Failed to update variable")
        )
      }
    } catch (error) {
      console.error("Update env var error:", error)
      toast.error("An error occurred while updating the variable")
    } finally {
      setIsEditLoading(false)
    }
  }

  const handleDeleteVar = async (envVar: EnvVar) => {
    if (!projectName) return
    const confirmed = window.confirm(
      `Delete ${envVar.key}? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      const response = await fetch(
        `${baseUrl}/api/projects/name/${projectName}/env-vars/${envVar.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      if (response.ok) {
        toast.success("Variable deleted")
        setEnvVars((prev) => prev.filter((item) => item.id !== envVar.id))
        return
      }

      toast.error(await getErrorMessage(response, "Failed to delete variable"))
    } catch (error) {
      console.error("Delete env var error:", error)
      toast.error("An error occurred while deleting the variable")
    }
  }

  const handleCopyValue = async (envVar: EnvVar) => {
    try {
      await navigator.clipboard.writeText(envVar.value)
      toast.success("Value copied to clipboard")
    } catch (error) {
      console.error("Copy env var error:", error)
      toast.error("Failed to copy value")
    }
  }

  const handleToggleReveal = (id: string) => {
    setRevealedValues((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleLinkSharedVariable = () => {
    toast.message("Shared variables are coming soon")
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!projectName) {
    return null
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 p-5 md:p-8">
      <EnvVarsHeader
        actions={
          <>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleLinkSharedVariable}
            >
              <Link2 className="h-4 w-4" />
              Link Shared Variable
            </Button>
            <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Environment Variable
            </Button>
          </>
        }
      />

      <EnvVarsAddDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSubmit={handleAddVar}
        isLoading={isAddLoading}
        newKey={newKey}
        newValue={newValue}
        onKeyChange={setNewKey}
        onValueChange={setNewValue}
      />

      <Tabs defaultValue="project" className="w-full">
        <TabsList variant="line">
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="project" className="mt-4 space-y-4">
          <EnvVarsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {filteredVars.length === 0 ? (
            <EnvVarsEmptyState onAdd={() => setIsAddOpen(true)} />
          ) : (
            <EnvVarsTable
              items={filteredVars}
              maskedValue={MASKED_VALUE}
              revealedValues={revealedValues}
              onToggleReveal={handleToggleReveal}
              onEdit={setEditingVar}
              onCopy={handleCopyValue}
              onDelete={handleDeleteVar}
            />
          )}
        </TabsContent>

        <TabsContent value="shared" className="mt-4">
          <EnvVarsSharedState onLinkShared={handleLinkSharedVariable} />
        </TabsContent>
      </Tabs>

      <EnvVarsEditDialog
        open={Boolean(editingVar)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVar(null)
          }
        }}
        onSubmit={handleEditVar}
        isLoading={isEditLoading}
        editKey={editKey}
        editValue={editValue}
        onKeyChange={setEditKey}
        onValueChange={setEditValue}
      />
    </div>
  )
}
