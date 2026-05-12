"use client"

import { Rocket } from "lucide-react"
import { ProjectSelectionRequired } from "@/components/project-selection-required"

export default function DeploymentsPage() {
  return (
    <ProjectSelectionRequired
      featureName="Deployments"
      description="Monitor and manage your application deployments."
      icon={Rocket}
    />
  )
}
