import { useState } from "react"
import { Loader2, GitBranch, Lock, Globe, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateProject, useGitHubRepos } from "@/lib/queries"
import { GitHubRepo } from "@/lib/types"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)

  const { mutate: createProject, isPending: isLoading } = useCreateProject()
  const { data: repos, isLoading: isLoadingRepos, error: reposError } = useGitHubRepos(open)

  const [formData, setFormData] = useState({
    repoUrl: "",
    framework: "VITE",
    buildCommand: "npm run build",
    outputDir: "dist",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setFormData((prev) => ({
      ...prev,
      repoUrl: `https://github.com/${repo.fullName}`,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.repoUrl) {
      setError("Please select a repository or enter a URL")
      return
    }

    createProject(formData, {
      onSuccess: () => {
        onProjectCreated()
        onOpenChange(false)
        // Reset form
        setSelectedRepo(null)
        setSearchQuery("")
        setFormData({
          repoUrl: "",
          framework: "VITE",
          buildCommand: "npm run build",
          outputDir: "dist",
        })
      },
      onError: (err) => {
        setError(err.message || "An error occurred")
      },
    })
  }

  const filteredRepos = repos?.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  const hasGitHubRepos = repos && repos.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Project</DialogTitle>
            <DialogDescription>
              {hasGitHubRepos
                ? "Select a repository from your GitHub account or enter a URL manually."
                : "Connect your repository to deploy it automatically."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6 flex-1 min-h-0 overflow-y-auto">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* GitHub Repos Section */}
            {isLoadingRepos && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading your repositories...
              </div>
            )}

            {hasGitHubRepos && (
              <div className="grid gap-3">
                <Label>Select a Repository</Label>
                <div className="relative">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repositories..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="border rounded-md max-h-[240px] overflow-y-auto">
                  {filteredRepos.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No repositories found matching &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredRepos.map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        className={`w-full flex items-start gap-3 p-3 text-left hover:bg-accent/50 transition-colors border-b last:border-b-0 ${
                          selectedRepo?.id === repo.id ? "bg-accent" : ""
                        }`}
                        onClick={() => handleRepoSelect(repo)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {repo.fullName}
                            </span>
                            {repo.private ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 shrink-0">
                                <Lock className="h-2.5 w-2.5" />
                                Private
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 shrink-0">
                                <Globe className="h-2.5 w-2.5" />
                                Public
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Manual URL input — always shown as fallback */}
            <div className="grid gap-2">
              <Label htmlFor="repoUrl">
                {hasGitHubRepos ? "Or enter Repository URL manually" : "Repository URL"}
              </Label>
              <div className="relative">
                <GitBranch className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/username/repo"
                  className="pl-9"
                  value={formData.repoUrl}
                  onChange={(e) => {
                    handleChange("repoUrl", e.target.value)
                    if (selectedRepo && e.target.value !== `https://github.com/${selectedRepo.fullName}`) {
                      setSelectedRepo(null)
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="framework">Framework Preset</Label>
              <Select
                value={formData.framework}
                onValueChange={(v) => handleChange("framework", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a framework" />
                </SelectTrigger>
                <SelectContent className="p-1">
                  <SelectItem value="VITE">Vite</SelectItem>
                  <SelectItem value="STATIC">Static HTML/JS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buildCommand">Build Command</Label>
                <Input
                  id="buildCommand"
                  placeholder="npm run build"
                  value={formData.buildCommand}
                  onChange={(e) => handleChange("buildCommand", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="outputDir">Output Directory</Label>
                <Input
                  id="outputDir"
                  placeholder="dist"
                  value={formData.outputDir}
                  onChange={(e) => handleChange("outputDir", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
