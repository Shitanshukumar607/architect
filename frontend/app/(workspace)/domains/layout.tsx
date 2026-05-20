import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Domains | Architect",
  description:
    "Manage custom domains for your deployed projects. Enable HTTPS and configure DNS settings.",
  keywords: ["domains", "DNS", "HTTPS", "custom domains", "SSL certificates"],
}

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
