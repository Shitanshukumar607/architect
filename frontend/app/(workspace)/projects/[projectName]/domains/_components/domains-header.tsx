
import type { ReactNode } from "react"
import { toast } from "sonner"

interface DomainsHeaderProps {
  actions?: ReactNode
}

export function DomainsHeader({ actions }: DomainsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Domains
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage custom domains and SSL certificates.{" "}
          <a
            className="text-primary hover:underline cursor-pointer"
            onClick={() =>
              toast.message("@TODO: Implement learn more functionality.")
            }
          >
            Learn more
          </a>
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}
