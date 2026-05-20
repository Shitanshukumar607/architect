import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GitHubRepo } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, GitBranch, Settings } from "lucide-react"
import { GitHubIcon } from "./icons"

interface FormDataType {
  repoUrl: string
  framework: string
  buildCommand: string
  outputDir: string
}

interface ConfigureStepProps {
  selectedRepo: GitHubRepo | null
  formData: FormDataType
  handleChange: (field: string, value: string) => void
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>
  setStep: (step: 1 | 2) => void
  getDerivedProjectName: (url: string) => string
  showAdvanced: boolean
  setShowAdvanced: (show: boolean) => void
}

export function ConfigureStep({
  selectedRepo,
  formData,
  handleChange,
  setFormData,
  setStep,
  getDerivedProjectName,
  showAdvanced,
  setShowAdvanced,
}: ConfigureStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <GitHubIcon className="h-6 w-6 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {selectedRepo ? selectedRepo.fullName : formData.repoUrl}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              {selectedRepo
                ? selectedRepo.defaultBranch || "main"
                : "default branch"}
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStep(1)}
        >
          Change
        </Button>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        Your project will be hosted at{" "}
        <strong className="font-medium text-foreground">
          {getDerivedProjectName(formData.repoUrl) || "project"}
          .architect.shitanshu.me
        </strong>{" "}
        if it&apos;s available. Don&apos;t worry, you can change it later.
      </div>
      <div className="space-y-3">
        <Label>Framework Preset</Label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              handleChange("framework", "VITE")
              setFormData((prev: FormDataType) => ({
                ...prev,
                buildCommand: "npm run build",
                outputDir: "dist",
              }))
            }}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              formData.framework === "VITE"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            )}
          >
            <div>
              <div className="text-sm font-medium">Vite SPA</div>
              <div className="text-xs text-muted-foreground">React, Vite</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              handleChange("framework", "STATIC")
              setFormData((prev: FormDataType) => ({
                ...prev,
                buildCommand: "",
                outputDir: ".",
              }))
            }}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              formData.framework === "STATIC"
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            )}
          >
            <div>
              <div className="text-sm font-medium">Static Site</div>
              <div className="text-xs text-muted-foreground">HTML, CSS, JS</div>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-lg border">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between p-4 text-sm font-medium hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            Build & Output Settings
          </div>
          {showAdvanced ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showAdvanced && (
          <div className="grid gap-4 border-t p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buildCommand">Build Command</Label>
              <Input
                id="buildCommand"
                placeholder={
                  formData.framework === "VITE" ? "npm run build" : ""
                }
                value={formData.buildCommand}
                onChange={(e) => handleChange("buildCommand", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputDir">Output Directory</Label>
              <Input
                id="outputDir"
                placeholder={formData.framework === "VITE" ? "dist" : "."}
                value={formData.outputDir}
                onChange={(e) => handleChange("outputDir", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
