"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface EnvVarsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export function EnvVarsFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: EnvVarsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-background/60 md:flex-row md:items-center md:gap-4">
      <div className="relative w-full md:max-w-[420px]">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="Last Updated" />
          </SelectTrigger>
          <SelectContent className="p-1">
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
