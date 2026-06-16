import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function CustomersPage() {
  const session = await auth();
  if (!session) return null;

  const customers = await db.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { devices: true }
      }
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
        <p className="text-muted-foreground">Registre des clients IT BUSINESS.</p>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-right">Appareils enregistrés</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.fullName}</TableCell>
                <TableCell>{c.phone1}</TableCell>
                <TableCell>{c.email || '-'}</TableCell>
                <TableCell>{c.address}</TableCell>
                <TableCell className="text-right">{c._count.devices}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
