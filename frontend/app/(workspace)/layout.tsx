"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { signOut, useSession } from "@/lib/auth-client"
import { Activity } from "lucide-react"

import { SidebarComponent } from "../../components/Sidebar"
import { TopbarComponent } from "../../components/Topbar"

type SidebarItem = "dashboard" | "projects" | "settings"

const sidebarRoutes: Array<{
  item: SidebarItem
  path: string
}> = [
  { item: "dashboard", path: "/dashboard" },
  { item: "projects", path: "/projects" },
  { item: "settings", path: "/settings" },
]

function getActiveSidebarItem(pathname: string): SidebarItem {
  const matchedRoute = sidebarRoutes.find(
    ({ path }) => pathname === path || pathname.startsWith(`${path}/`)
  )

  return matchedRoute?.item ?? "dashboard"
}

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in")
    }
  }, [isPending, session, router])

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in")
        },
      },
    })
  }

  const initials = (session?.user?.email || "U")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase()

  const activeItem = getActiveSidebarItem(pathname)

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 animate-pulse" />
          Loading…
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen>
      <SidebarComponent activeItem={activeItem} />

      <SidebarInset>
        <TopbarComponent initials={initials} onSignOut={handleSignOut} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
