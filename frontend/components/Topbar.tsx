"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, CircleHelp, Settings } from "lucide-react"

export function TopbarComponent({
  initials,
  onSignOut,
}: {
  initials: string
  onSignOut: () => void
}) {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const label = segment
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    }
  })

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item) => (
              <Fragment key={item.href}>
                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" disabled>
          <Bell />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon-sm" disabled>
          <CircleHelp />
          <span className="sr-only">Help</span>
        </Button>
        <Button variant="ghost" size="icon-sm" disabled>
          <Settings />
          <span className="sr-only">Settings</span>
        </Button>
        <div className="flex items-center gap-2 pl-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-8 text-xs text-muted-foreground md:inline-flex"
            onClick={onSignOut}
          >
            Sign out
          </Button>
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
