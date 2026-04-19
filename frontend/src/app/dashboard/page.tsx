import { auth } from "@/auth"
import { db } from "@/lib/db"
import { TopNav } from "@/components/layout/top-nav"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building2, Layers, TrendingUp } from "lucide-react"
import { NewProjectButton } from "@/components/projects/new-project-button"

export default async function DashboardPage() {
  const session = await auth()
  const user = session?.user as any

  if (!user) return null

  // Multi-tenant data fetching logic
  let projects = []
  let stats = {
    projectCount: 0,
    companyCount: 0,
    totalBudget: 0
  }

  if (user.role === "PLATFORM_ADMIN") {
    projects = await db.project.findMany({
      include: { company: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    
    stats.projectCount = await db.project.count()
    stats.companyCount = await db.company.count()
    const budgetSum = await db.project.aggregate({
      _sum: { budget: true }
    })
    stats.totalBudget = Number(budgetSum._sum.budget) || 0
  } else {
    projects = await db.project.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' }
    })
    
    stats.projectCount = projects.length
    const budgetSum = await db.project.aggregate({
      where: { companyId: user.companyId },
      _sum: { budget: true }
    })
    stats.totalBudget = Number(budgetSum._sum.budget) || 0
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <TopNav userName={user.name} userRole={user.role} />
      
      <main className="container mx-auto p-6 md:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground italic">
              Welcome back, {user.name}. Here is what's happening today.
            </p>
          </div>
          {user.role !== 'PLATFORM_ADMIN' && <NewProjectButton />}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projectCount}</div>
              <p className="text-xs text-muted-foreground mt-1">+2 from last month</p>
            </CardContent>
          </Card>

          {user.role === 'PLATFORM_ADMIN' && (
            <Card className="border-none shadow-md bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.companyCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Operating companies</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500/10 to-emerald-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalBudget.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Approved budgets</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Layers className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">Requires review</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects Table */}
        <Card className="shadow-lg border-primary/5">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              A overview of the latest projects across the {user.role === 'PLATFORM_ADMIN' ? 'platform' : 'company'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px]">Project Name</TableHead>
                  {user.role === 'PLATFORM_ADMIN' && <TableHead>Tenant</TableHead>}
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project: any) => (
                  <TableRow key={project.id} className="group transition-colors">
                    <TableCell className="font-semibold text-primary/80 group-hover:text-primary">
                      {project.name}
                    </TableCell>
                    {user.role === 'PLATFORM_ADMIN' && (
                      <TableCell className="font-medium">
                        {project.company.name}
                      </TableCell>
                    )}
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.status === 'COMPLETED' ? 'outline' : 'default'}
                        className={project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}
                      >
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      ${Number(project.budget).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
