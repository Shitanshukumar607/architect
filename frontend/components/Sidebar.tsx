"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  BookOpen,
  GitBranch,
  Globe,
  Plus,
  Rocket,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react"

const navigationItems = [
  {
    key: "projects",
    href: "/projects",
    label: "Projects",
    tooltip: "Projects",
    icon: GitBranch,
  },
  {
    key: "domains",
    href: "/domains",
    label: "Domains",
    tooltip: "Domains",
    icon: Globe,
  },
  {
    key: "environment-variables",
    href: "/environment-variables",
    label: "Environment Variables",
    tooltip: "Environment Variables",
    icon: ShieldCheck,
  },
  {
    key: "deployments",
    href: "/deployments",
    label: "Deployments",
    tooltip: "Deployments",
    icon: Rocket,
  },
  {
    key: "settings",
    href: "/settings",
    label: "Settings",
    tooltip: "Settings",
    icon: Settings,
  },
] as const

const footerItems = [
  {
    href: "/docs",
    label: "Documentation",
    tooltip: "Documentation",
    icon: BookOpen,
  },
  {
    href: "/support",
    label: "Support",
    tooltip: "Support",
    icon: ShieldAlert,
  },
] as const

type SidebarLinkItem = (typeof navigationItems)[number]
type SidebarActionItem = (typeof footerItems)[number]

function SidebarNavItem({
  item,
  isActive,
}: {
  item: SidebarLinkItem | SidebarActionItem
  isActive?: boolean
}) {
  const Icon = item.icon
  const isLinkItem = "href" in item
  const isDisabledItem = "disabled" in item && item.disabled

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={isLinkItem && !isDisabledItem}
        isActive={isActive}
        tooltip={item.tooltip}
      >
        {isLinkItem && !isDisabledItem ? (
          <Link href={item.href}>
            <Icon />
            <span>{item.label}</span>
          </Link>
        ) : (
          <>
            <Icon />
            <span>{item.label}</span>
          </>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function SidebarComponent({
  activeItem,
}: {
  activeItem: "projects" | "domains" | "environment-variables" | "deployments" | "settings"
}) {
  const params = useParams()
  const projectName = params?.projectName as string | undefined

  const updatedNavigationItems = navigationItems.map((item) => {
    if (projectName && item.key !== "projects") {
      return {
        ...item,
        href: `/projects/${projectName}${item.href}` as const,
      }
    }
    return item
  })

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GitBranch className="size-4" />
          </div>
          <div className="min-w-0 leading-none">
            <div className="truncate text-lg font-medium text-foreground">
              Architect
            </div>
          </div>
        </div>
        <SidebarSeparator />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled
              >
                <Plus className="mr-1.5 size-4" />
                New Project
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {/* <SidebarGroupLabel>Navigation</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="flex gap-1">
              {updatedNavigationItems.map((item) => (
                <SidebarNavItem
                  key={item.key}
                  item={item}
                  isActive={activeItem === item.key}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="mx-2 w-auto bg-sidebar-border" />
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarNavItem key={item.label} item={item} />
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
