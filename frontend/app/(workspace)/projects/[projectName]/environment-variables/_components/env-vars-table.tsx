"use client"

import { format } from "date-fns"
import { Copy, Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { EnvVar } from "./env-vars.types"

interface EnvVarsTableProps {
  items: EnvVar[]
  maskedValue: string
  revealedValues: Record<string, boolean>
  onToggleReveal: (id: string) => void
  onEdit: (envVar: EnvVar) => void
  onCopy: (envVar: EnvVar) => void
  onDelete: (envVar: EnvVar) => void
}

export function EnvVarsTable({
  items,
  maskedValue,
  revealedValues,
  onToggleReveal,
  onEdit,
  onCopy,
  onDelete,
}: EnvVarsTableProps) {
  return (
    <div className="rounded-xl border bg-background/60 shadow-sm">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variable</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[160px]">Last Updated</TableHead>
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((envVar) => {
              const updatedAt = envVar.updatedAt || envVar.createdAt
              const updatedLabel = updatedAt
                ? `Updated ${format(new Date(updatedAt), "MMM d")}`
                : "Updated recently"
              const isRevealed = revealedValues[envVar.id]

              return (
                <TableRow key={envVar.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{envVar.key}</span>
                        <Badge variant="secondary" className="rounded-full">
                          All Environments
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Project variable
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="max-w-[220px] truncate font-mono text-xs text-muted-foreground">
                        {isRevealed ? envVar.value : maskedValue}
                      </span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onToggleReveal(envVar.id)}
                          >
                            {isRevealed ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={6}>
                          {isRevealed ? "Hide value" : "Reveal value"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {updatedLabel}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(envVar)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopy(envVar)}>
                          <Copy className="h-4 w-4" />
                          Copy value
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(envVar)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
  )
}
