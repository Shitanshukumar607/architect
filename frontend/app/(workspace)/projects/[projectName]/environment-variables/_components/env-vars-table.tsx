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
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Variable
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                Value
              </TableHead>
              <TableHead className="w-[160px] px-4 py-3 text-xs font-semibold text-muted-foreground">
                Last Updated
              </TableHead>
              <TableHead className="w-[56px] px-4 py-3 text-xs font-semibold text-muted-foreground" />
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
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{envVar.key}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block max-w-[200px] truncate font-mono text-xs text-muted-foreground md:max-w-[260px]">
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
