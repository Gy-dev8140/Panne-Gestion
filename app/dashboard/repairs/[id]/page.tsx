import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RepairDetailClient } from './repair-detail-client';

export default async function RepairDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;

  const repair = await db.repairOrder.findUnique({
    where: { id },
    include: {
      device: {
        include: { customer: true }
      },
      createdBy: true,
      statusHistory: {
        include: { changedBy: true },
        orderBy: { changedAt: 'desc' }
      },
      notes: {
        include: { technician: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!repair) notFound();

  // Parse accessories JSON string to array of strings
  let parsedAccessories: string[] = [];
  try {
    parsedAccessories = JSON.parse(repair.accessories || '[]');
  } catch (e) {
    parsedAccessories = repair.accessories ? repair.accessories.split(',') : [];
  }

  const repairWithParsedAccessories = {
    ...repair,
    accessories: parsedAccessories
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dossier {repair.dossierNumber}</h2>
          <p className="text-muted-foreground">Créé le {format(new Date(repair.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
        </div>
        <div className="flex gap-3 items-center">
          <Badge className="text-sm px-3 py-1 bg-slate-800 uppercase">{repair.status.replace(/_/g, ' ')}</Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">{repair.urgency} urgence</Badge>
        </div>
      </div>

      {/* Passing to a client component to handle Print PDF and Status updates */}
      <RepairDetailClient repair={repairWithParsedAccessories} />

    </div>
  );
}
