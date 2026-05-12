"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface DomainsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function DomainsFilters({
  searchQuery,
  onSearchChange,
}: DomainsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-background/60 md:flex-row md:items-center md:gap-4">
      <div className="relative w-full md:max-w-[420px]">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search domains..."
          className="pl-9"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  )
}
