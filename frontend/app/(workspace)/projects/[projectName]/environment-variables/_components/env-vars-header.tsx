"use client"

import type { ReactNode } from "react"

interface EnvVarsHeaderProps {
  title: string
  description: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
}

export function EnvVarsHeader({
  title,
  description,
  eyebrow,
  actions,
}: EnvVarsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2">
        {eyebrow ? (
          <div className="flex items-center gap-2">{eyebrow}</div>
        ) : null}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
