"use client"

import { format } from "date-fns"
import { Copy, MoreHorizontal, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Domain {
  id: string
  hostname: string
  verified: boolean
  createdAt?: string
  updatedAt?: string
}

interface DomainsTableProps {
  items: Domain[]
  onEdit: (domain: Domain) => void
  onCopy: (hostname: string) => void
}

export function DomainsTable({ items, onEdit, onCopy }: DomainsTableProps) {
  return (
    <div className="rounded-xl border bg-background/60 shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Domain
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Updated
            </TableHead>
            <TableHead className="w-[56px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((domain) => {
            const updatedAt = domain.updatedAt || domain.createdAt
            const updatedLabel = updatedAt
              ? format(new Date(updatedAt), "MMM d, yyyy")
              : "Recently added"

            return (
              <TableRow
                key={domain.id}
                className="transition-colors hover:bg-muted/10 group"
              >
                <TableCell className="px-4 py-3 font-medium">
                  {domain.hostname}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant={domain.verified ? "default" : "secondary"}
                    className="rounded-full px-2 py-0 text-[10px] uppercase font-bold"
                  >
                    {domain.verified ? "Verified" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                  {updatedLabel}
                </TableCell>
                <TableCell className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(domain)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCopy(domain.hostname)}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy hostname
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
