import { 
  Plus, 
  FileText, 
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function QuickActions() {
  return (
    <Card className="md:col-span-2 border-none shadow-none bg-background/50">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
        <CardDescription>
          Common tasks you might want to perform.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          className="h-12 w-full justify-start gap-4 text-[13px] font-semibold border-muted/20 hover:bg-muted/30 hover:border-muted/40 transition-all rounded-xl"
          variant="outline"
        >
          <div className="bg-primary/10 p-2 rounded-lg">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          New Project
        </Button>
        <Button
          className="h-12 w-full justify-start gap-4 text-[13px] font-semibold border-muted/20 hover:bg-muted/30 hover:border-muted/40 transition-all rounded-xl"
          variant="outline"
        >
          <div className="bg-muted/50 p-2 rounded-lg">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          View Documentation
        </Button>
        <Button
          className="h-12 w-full justify-start gap-4 text-[13px] font-semibold border-muted/20 hover:bg-muted/30 hover:border-muted/40 transition-all rounded-xl"
          variant="outline"
        >
          <div className="bg-muted/50 p-2 rounded-lg">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          System Status
        </Button>
      </CardContent>
    </Card>
  )
}
