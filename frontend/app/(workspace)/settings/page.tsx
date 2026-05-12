"use client"

import { Settings } from "lucide-react"
import { ProjectSelectionRequired } from "@/components/project-selection-required"

export default function SettingsPage() {
  return (
    <ProjectSelectionRequired
      featureName="Settings"
      description="Manage your account and project settings."
      icon={Settings}
    />
  )
}
