import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Deployments | Architect",
  description:
    "View and manage your application deployments. Monitor build status, logs, and deployment history.",
  keywords: ["deployments", "builds", "logs", "deployment status", "CI/CD"],
}

export default function DeploymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
