import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | Architect",
  description:
    "Manage your account and workspace settings. Configure preferences and manage access controls.",
  keywords: [
    "settings",
    "preferences",
    "account",
    "workspace",
    "configuration",
  ],
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
