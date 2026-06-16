import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, CheckCircle, PackageOpen, Monitor, Clock } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) return null;

  // Real stats using Prisma
  const [totalRepairs, pending, inProgress, repaired, delivered] = await Promise.all([
    db.repairOrder.count(),
    db.repairOrder.count({ where: { status: { in: ['RECU', 'EN_ATTENTE_CLIENT'] } } }),
    db.repairOrder.count({ where: { status: 'EN_COURS' } }),
    db.repairOrder.count({ where: { status: 'REPARE' } }),
    db.repairOrder.count({ where: { status: 'LIVRE' } }),
  ])
  
  const recentRepairs = await db.repairOrder.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { device: { include: { customer: true } } }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de Bord</h2>
        <p className="text-muted-foreground">
          Bonjour, {session.user.name || "Admin"}. Voici un aperçu des activités.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dossiers</CardTitle>
            <BoxIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRepairs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">En Cours</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Réparés</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{repaired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Livrés</CardTitle>
            <PackageOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{delivered}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Dossiers Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRepairs.length === 0 ? (
                 <div className="text-center text-muted-foreground p-4">Aucun dossier trouvé.</div>
              ) : recentRepairs.map(repair => (
                <div key={repair.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{repair.dossierNumber} - {repair.device.customer.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {repair.device.brand} {repair.device.model} ({repair.device.category})
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge variant="outline">{repair.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dummy Chart container */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Rendement Réparations</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed bg-slate-50/50">
             <span className="text-sm text-muted-foreground">Graphique en cours de développement</span>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

function BoxIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 0 0-1-1.73 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 1.73 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
