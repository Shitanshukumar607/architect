import { Search, GitBranch, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitHubRepo } from "@/lib/types"
import { cn } from "@/lib/utils"
import { GitHubIcon } from "./icons"

export const RepoListSkeleton = () => (
  <div className="rounded-md border">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between border-b p-4 last:border-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-5 w-5 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
      </div>
    ))}
  </div>
)

interface ImportStepProps {
  sourceTab: "github" | "manual"
  setSourceTab: (tab: "github" | "manual") => void
  setError: (error: string | null) => void
  isLoadingRepos: boolean
  hasGitHubRepos: boolean | undefined
  handleConnectGitHub: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredRepos: GitHubRepo[]
  handleRepoSelect: (repo: GitHubRepo) => void
  manualUrlInput: string
  setManualUrlInput: (url: string) => void
}

export function ImportStep({
  sourceTab,
  setSourceTab,
  setError,
  isLoadingRepos,
  hasGitHubRepos,
  handleConnectGitHub,
  searchQuery,
  setSearchQuery,
  filteredRepos,
  handleRepoSelect,
  manualUrlInput,
  setManualUrlInput,
}: ImportStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => {
            setSourceTab("github")
            setError(null)
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
            sourceTab === "github"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitHubIcon className="h-4 w-4" />
          GitHub
        </button>
        <button
          type="button"
          onClick={() => {
            setSourceTab("manual")
            setError(null)
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
            sourceTab === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-4 w-4" />
          Git URL
        </button>
      </div>

      {sourceTab === "github" ? (
        <div className="space-y-4">
          {isLoadingRepos ? (
            <RepoListSkeleton />
          ) : !hasGitHubRepos ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <GitHubIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Connect GitHub</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your GitHub account to import repositories.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleConnectGitHub}
                variant="outline"
              >
                <GitHubIcon className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-md border">
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredRepos.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No repositories found.
                    </div>
                  ) : (
                    filteredRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center justify-between border-b p-4 last:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <GitHubIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">
                              {repo.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {repo.fullName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {repo.private ? (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Lock className="mr-1 h-3 w-3" />
                              Private
                            </span>
                          ) : (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Globe className="mr-1 h-3 w-3" />
                              Public
                            </span>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => handleRepoSelect(repo)}
                          >
                            Import
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manualUrl">Repository URL</Label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="manualUrl"
                placeholder="https://github.com/username/repo"
                className="pl-9"
                value={manualUrlInput}
                onChange={(e) => setManualUrlInput(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the HTTPS or SSH clone URL of any public Git repository.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
