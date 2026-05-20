import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Environment Variables | Architect",
  description:
    "Configure environment variables for your projects. Manage secrets, API keys, and application settings.",
  keywords: [
    "environment variables",
    "configuration",
    "secrets",
    "API keys",
    "project settings",
  ],
}

export default function EnvironmentVariablesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
