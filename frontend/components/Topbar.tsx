"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import { cn } from "@/lib/utils"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

    const decodedSegment = decodeURIComponent(segment)
    const label = decodedSegment;

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    }
  })

  const allBreadcrumbs = [
    { href: "", label: "Workspace", isLast: segments.length === 0 },
    ...breadcrumbItems,
  ]

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-2 md:hidden" />
        <Breadcrumb>
          <BreadcrumbList>
            {allBreadcrumbs.map((item, index) => (
              <Fragment key={item.href}>
                <BreadcrumbItem
                  className={cn(index === 0 && "hidden md:block")}
                >
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!item.isLast && (
                  <BreadcrumbSeparator
                    className={cn(index === 0 && "hidden md:block")}
                  />
                )}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end" sideOffset={8}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm leading-none text-foreground">Notifications</h4>
                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded">0 new</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-muted/50 p-2.5 mb-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You don&apos;t have any notifications right now.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/support">
            <CircleHelp />
            <span className="sr-only">Help</span>
          </Link>
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
