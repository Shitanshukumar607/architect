"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EnvVarsFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  environmentFilter: string
  onEnvironmentFilterChange: (value: string) => void
  editorFilter: string
  onEditorFilterChange: (value: string) => void
  variableFilter: string
  onVariableFilterChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
}

export function EnvVarsFilters({
  searchQuery,
  onSearchChange,
  environmentFilter,
  onEnvironmentFilterChange,
  editorFilter,
  onEditorFilterChange,
  variableFilter,
  onVariableFilterChange,
  sortBy,
  onSortChange,
}: EnvVarsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background/60 p-3 shadow-sm md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          value={environmentFilter}
          onValueChange={onEnvironmentFilterChange}
        >
          <SelectTrigger className="min-w-[160px]">
            <SelectValue placeholder="All Environments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="preview">Preview</SelectItem>
          </SelectContent>
        </Select>
        <Select value={editorFilter} onValueChange={onEditorFilterChange}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="All Editors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Editors</SelectItem>
            <SelectItem value="you">You</SelectItem>
            <SelectItem value="team">Team</SelectItem>
          </SelectContent>
        </Select>
        <Select value={variableFilter} onValueChange={onVariableFilterChange}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="All Variables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Variables</SelectItem>
            <SelectItem value="secret">Secrets</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="min-w-[140px]">
            <SelectValue placeholder="Last Updated" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
