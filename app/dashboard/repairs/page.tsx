import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default async function RepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const sp = await searchParams;
  const searchQuery = sp?.q || '';
  const statusQuery = sp?.status || '';

  const whereClause: any = {};
  if (searchQuery) {
    whereClause.OR = [
      { dossierNumber: { contains: searchQuery, mode: 'insensitive' } },
      { device: { brand: { contains: searchQuery, mode: 'insensitive' } } },
      { device: { model: { contains: searchQuery, mode: 'insensitive' } } },
      { device: { customer: { fullName: { contains: searchQuery, mode: 'insensitive' } } } },
      { device: { customer: { phone1: { contains: searchQuery, mode: 'insensitive' } } } },
    ];
  }
  if (statusQuery) {
    whereClause.status = statusQuery;
  }

  const repairs = await db.repairOrder.findMany({
    where: whereClause,
    include: {
      device: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dossiers de Réparation</h2>
          <p className="text-muted-foreground">Gérez toutes les interventions IT BUSINESS.</p>
        </div>
        <Link href="/dashboard/repairs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Dossier
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 py-4">
        <form className="flex w-full max-w-sm items-center space-x-2" method="GET">
          <Input 
            name="q" 
            type="search" 
            placeholder="Rechercher (dossier, nom, tel...)" 
            defaultValue={searchQuery}
          />
          <Button type="submit" variant="secondary">Go</Button>
          {(searchQuery || statusQuery) && (
            <Link href="/dashboard/repairs">
              <Button variant="ghost">Effacer</Button>
            </Link>
          )}
        </form>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Dossier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Appareil</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repairs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Aucun dossier trouvé.
                </TableCell>
              </TableRow>
            ) : (
              repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell className="font-medium">{repair.dossierNumber}</TableCell>
                  <TableCell>{new Date(repair.receptionDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    {repair.device.customer.fullName}
                    <div className="text-xs text-muted-foreground">{repair.device.customer.phone1}</div>
                  </TableCell>
                  <TableCell>
                    {repair.device.brand} {repair.device.model}
                    <div className="text-xs text-muted-foreground">{repair.description.substring(0, 30)}...</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={repair.status === 'LIVRE' ? 'secondary' : 'default'} className="bg-slate-800">
                      {repair.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/repairs/${repair.id}`}>
                      <Button variant="outline" size="sm">Ouvrir</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
