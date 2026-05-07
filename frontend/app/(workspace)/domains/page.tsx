"use client"

import { Globe } from "lucide-react"
import { ProjectSelectionRequired } from "@/components/project-selection-required"

export default function DomainsPage() {
  return (
    <ProjectSelectionRequired
      featureName="Domains"
      description="Manage your custom domains and SSL certificates."
      icon={Globe}
    />
  )
}
