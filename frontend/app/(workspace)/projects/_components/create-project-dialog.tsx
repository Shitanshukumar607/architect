import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCreateProject, useGitHubRepos } from "@/lib/queries"
import { GitHubRepo } from "@/lib/types"
import { authClient } from "@/lib/auth-client"
import { ImportStep } from "./create-project/import-step"
import { ConfigureStep } from "./create-project/configure-step"

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
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [sourceTab, setSourceTab] = useState<"github" | "manual">("github")
  const [error, setError] = useState<string | null>(null)

  // Step 1 state
  const [searchQuery, setSearchQuery] = useState("")
  const [manualUrlInput, setManualUrlInput] = useState("")

  // Step 2 state
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { mutate: createProject, isPending: isLoading } = useCreateProject()
  const { data: repos, isLoading: isLoadingRepos } = useGitHubRepos(open)

  const [formData, setFormData] = useState({
    repoUrl: "",
    framework: "VITE",
    buildCommand: "npm run build",
    outputDir: "dist",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOpenChange = (openState: boolean) => {
    onOpenChange(openState)
    if (!openState) {
      // Reset form state on close
      setStep(1)
      setSourceTab("github")
      setSelectedRepo(null)
      setSearchQuery("")
      setManualUrlInput("")
      setFormData({
        repoUrl: "",
        framework: "VITE",
        buildCommand: "npm run build",
        outputDir: "dist",
      })
      setShowAdvanced(false)
      setError(null)
    }
  }

  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setFormData((prev) => ({
      ...prev,
      repoUrl: `https://github.com/${repo.fullName}`,
    }))
    setStep(2)
  }

  const handleManualContinue = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      repoUrl: url,
    }))
    setSelectedRepo(null)
    setStep(2)
  }

  const handleConnectGitHub = async () => {
    try {
      setError(null)
      await authClient.signIn.social(
        {
          provider: "github",
          callbackURL: window.location.href,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to connect to GitHub")
          },
        }
      )
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (step === 1) {
      if (sourceTab === "manual") {
        if (!manualUrlInput) {
          setError("Please enter a repository URL")
          return
        }
        if (
          !manualUrlInput.startsWith("http://") &&
          !manualUrlInput.startsWith("https://") &&
          !manualUrlInput.startsWith("git@")
        ) {
          setError(
            "Please enter a valid Git URL (e.g. https://github.com/user/repo)"
          )
          return
        }
        setError(null)
        handleManualContinue(manualUrlInput)
      }
      return
    }

    if (!formData.repoUrl) {
      setError("Please select a repository or enter a URL")
      return
    }

    createProject(formData, {
      onSuccess: (createdProject) => {
        const targetName =
          createdProject?.name || getDerivedProjectName(formData.repoUrl)

        onProjectCreated()
        handleOpenChange(false)

        if (targetName) {
          router.push(`/projects/${targetName}`)
        }
      },
      onError: (err) => {
        setError(err.message || "An error occurred")
      },
    })
  }

  const getDerivedProjectName = (url: string) => {
    if (!url) return ""
    const repoName = url.split("/").pop()?.replace(".git", "") || "project"
    return repoName.toLowerCase().replace(/[^a-z0-9]/g, "-")
  }

  const filteredRepos =
    repos?.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? []

  const hasGitHubRepos = repos && repos.length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden p-0 sm:max-w-[560px]">
        <form
          onSubmit={handleSubmit}
          className="mb-3 flex min-h-0 flex-1 flex-col"
        >
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle>
                {step === 1 ? "Create a new project" : "Configure project"}
              </DialogTitle>
              <DialogDescription>
                {step === 1
                  ? "Import an existing repository or use a public Git URL."
                  : "Set up your framework and build settings."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {step === 1 ? (
              <ImportStep
                sourceTab={sourceTab}
                setSourceTab={setSourceTab}
                setError={setError}
                isLoadingRepos={isLoadingRepos}
                hasGitHubRepos={hasGitHubRepos}
                handleConnectGitHub={handleConnectGitHub}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filteredRepos={filteredRepos}
                handleRepoSelect={handleRepoSelect}
                manualUrlInput={manualUrlInput}
                setManualUrlInput={setManualUrlInput}
              />
            ) : (
              <ConfigureStep
                selectedRepo={selectedRepo}
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                setStep={setStep}
                getDerivedProjectName={getDerivedProjectName}
                showAdvanced={showAdvanced}
                setShowAdvanced={setShowAdvanced}
              />
            )}
          </div>

          <DialogFooter className="mt-6 border-t bg-muted/20 p-4 px-6 sm:justify-end">
            {step === 1 ? (
              <>
                <Button
                  key="cancel-btn"
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                {sourceTab === "manual" && (
                  <Button
                    key="continue-btn"
                    type="button"
                    onClick={() => {
                      if (!manualUrlInput) {
                        setError("Please enter a repository URL")
                        return
                      }
                      if (
                        !manualUrlInput.startsWith("http://") &&
                        !manualUrlInput.startsWith("https://") &&
                        !manualUrlInput.startsWith("git@")
                      ) {
                        setError(
                          "Please enter a valid Git URL (e.g. https://github.com/user/repo)"
                        )
                        return
                      }
                      setError(null)
                      handleManualContinue(manualUrlInput)
                    }}
                  >
                    Continue
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  key="back-btn"
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button key="deploy-btn" type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Deploy Project
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
