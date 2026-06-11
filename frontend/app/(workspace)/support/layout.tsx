import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support - Architect",
  description:
    "Get in touch with the Architect support team for help with your projects, domains, or billing inquiries.",
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
