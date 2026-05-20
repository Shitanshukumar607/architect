import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Projects | Architect",
  description:
    "Manage your applications and deployments. Create, configure, and monitor your projects.",
  keywords: [
    "projects",
    "deployments",
    "applications",
    "infrastructure",
    "deployment platform",
  ],
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
