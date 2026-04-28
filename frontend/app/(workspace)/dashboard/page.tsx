import { 
  Folder, 
  RefreshCw, 
  CheckCircle2, 
  CreditCard
} from "lucide-react"
import { StatCard } from "./_components/stat-card"
import { RecentDeployments, type Deployment } from "./_components/recent-deployments"
import { QuickActions } from "./_components/quick-actions"

const deployments: Deployment[] = [
  {
    id: "1",
    project: "api-gateway-prod",
    environment: "Production",
    status: "Success",
    branch: "main",
    commit: "a1b2c3d",
    time: "2 mins ago",
  },
  {
    id: "2",
    project: "frontend-dashboard",
    environment: "Staging",
    status: "Building",
    branch: "feat/new-ui",
    commit: "8f9e0d1",
    time: "In progress",
  },
  {
    id: "3",
    project: "user-db-cluster",
    environment: "Production",
    status: "Failed",
    branch: "main",
    commit: "4a5b6c7",
    time: "1 hr ago",
  },
  {
    id: "4",
    project: "auth-service",
    environment: "Production",
    status: "Success",
    branch: "main",
    commit: "2d3e4f5",
    time: "3 hrs ago",
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-medium text-lg">
          Overview of your infrastructure and deployments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Projects"
          value="24"
          icon={Folder}
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatCard 
          title="Active Deployments"
          value="8"
          icon={RefreshCw}
          description="Currently running"
        />
        <StatCard 
          title="Success Rate"
          value="99.8%"
          icon={CheckCircle2}
          description="Last 30 days"
        />
        <StatCard 
          title="Infrastructure Cost"
          value="$4,250"
          icon={CreditCard}
          trend={{ value: "+5%", direction: "up" }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <RecentDeployments deployments={deployments} />
        <QuickActions />
      </div>
    </div>
  )
}
