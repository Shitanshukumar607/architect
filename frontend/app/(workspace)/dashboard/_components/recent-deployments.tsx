import { 
  History,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Deployment {
  id: string
  project: string
  environment: string
  status: "Success" | "Building" | "Failed"
  branch: string
  commit: string
  time: string
}

interface RecentDeploymentsProps {
  deployments: Deployment[]
}

export function RecentDeployments({ deployments }: RecentDeploymentsProps) {
  return (
    <Card className="md:col-span-5 border-none shadow-none bg-background/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Recent Deployments</CardTitle>
          <CardDescription>
            A list of your latest deployment activities.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          View All <History className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-muted/20">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PROJECT</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">STATUS</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">BRANCH / COMMIT</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">TIME</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment) => (
              <TableRow key={deployment.id} className="border-muted/20">
                <TableCell className="py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">
                      {deployment.project}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      {deployment.environment}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      deployment.status === "Success"
                        ? "default"
                        : deployment.status === "Building"
                          ? "secondary"
                          : "destructive"
                    }
                    className={cn(
                      "px-2.5 py-0.5 rounded-full font-medium border text-[11px] shadow-none",
                      deployment.status === "Success" &&
                        "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
                      deployment.status === "Building" &&
                        "border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
                      deployment.status === "Failed" &&
                        "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    )}
                  >
                    <div
                      className={cn(
                        "mr-1.5 h-1.5 w-1.5 rounded-full",
                        deployment.status === "Success" && "bg-emerald-500",
                        deployment.status === "Building" &&
                          "animate-pulse bg-amber-500",
                        deployment.status === "Failed" && "bg-destructive"
                      )}
                    />
                    {deployment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">{deployment.branch}</span>
                    <span className="font-mono text-[11px] bg-muted/50 text-muted-foreground border border-muted/50 px-1.5 py-0.5 rounded uppercase tabular-nums">
                      {deployment.commit}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs font-medium tabular-nums">
                  {deployment.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
