import { Geist_Mono, IBM_Plex_Sans } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "./providers"

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Architect - Deploy Applications with Ease",
  description:
    "Architect is a modern deployment platform for web applications. Deploy, manage, and scale your projects effortlessly.",
  keywords: [
    "deployment",
    "platform",
    "hosting",
    "applications",
    "scalability",
    "DevOps",
  ],
  authors: [{ name: "Architect" }],
  creator: "Architect Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://architect.dev",
    siteName: "Architect",
    title: "Architect - Deploy Applications with Ease",
    description: "A modern deployment platform for web applications",
  },
  twitter: {
    card: "summary_large_image",
    title: "Architect",
    description: "Deploy applications with ease",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        ibmPlexSans.variable
      )}
    >
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
