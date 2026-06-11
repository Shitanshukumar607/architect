import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documentation - Architect",
  description: "Learn how to build, deploy, configure custom domains, and manage environment variables on the Architect platform.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
