import { GitBranch } from "lucide-react"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl text-muted-foreground">
          <GitBranch className="size-6 text-primary" />
          <span className="font-medium text-foreground">Architect</span>
        </div>

        {children}
      </div>
    </div>
  )
}
