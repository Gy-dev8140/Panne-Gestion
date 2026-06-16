'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Printer, Download, Save, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function RepairDetailClient({ repair }: { repair: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(repair.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/repairs/${repair.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      toast.success('Statut mis à jour !');
      router.refresh();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setIsUpdating(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(14, 165, 233); // Blue-ish
    doc.text("IT BUSINESS", 15, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Maintenance Informatique & Electronique", 15, 26);
    doc.text("Téléphone: 06 00 00 00 00 | Email: contact@itbusiness.com", 15, 32);
    
    // Dossier Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Fiche de Réparation : ${repair.dossierNumber}`, 15, 45);
    
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(repair.createdAt), 'dd/MM/yyyy HH:mm')}`, 140, 45);
    
    // Customer
    autoTable(doc, {
      startY: 55,
      head: [['Informations Client']],
      body: [
        [`Nom: ${repair.device.customer.fullName}`],
        [`Téléphone: ${repair.device.customer.phone1} ${repair.device.customer.phone2 ? ' / ' + repair.device.customer.phone2 : ''}`],
        [`Adresse: ${repair.device.customer.address}`],
        [`Email: ${repair.device.customer.email || 'N/A'}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Device
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Informations Appareil']],
      body: [
        [`Appareil: ${repair.device.brand} ${repair.device.model} (${repair.device.category})`],
        [`N° de série: ${repair.device.serialNumber || 'N/A'}`],
        [`État physique: ${repair.device.physicalCondition}`],
        [`Accessoires: ${repair.accessories.join(', ') || 'Aucun'}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });

    // Diagnostique
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Description de la panne']],
      body: [
        [repair.description],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }
    });
    
    doc.setFontSize(9);
    doc.text("Signature Client", 30, (doc as any).lastAutoTable.finalY + 30);
    doc.text("Signature IT BUSINESS", 130, (doc as any).lastAutoTable.finalY + 30);

    doc.save(`Dossier_${repair.dossierNumber}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1 */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations Appareil & Pannes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Appareil</p>
                <p>{repair.device.brand} - {repair.device.model}</p>
                <p className="text-sm text-slate-500">{repair.device.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Numéro de série</p>
                <p>{repair.device.serialNumber || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">État Physique</p>
                <p className="bg-slate-100 p-2 rounded text-sm">{repair.device.physicalCondition}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">Description de la panne</p>
                <p className="bg-slate-100 p-3 rounded text-sm">{repair.description}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-slate-500">Accessoires fournis :</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {repair.accessories.map((acc: String) => (
                    <span key={acc as string} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">{acc.toString()}</span>
                  ))}
                  {repair.accessories.length === 0 && <span className="text-sm text-slate-400">Aucun accessoire</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique Status */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 border-l-2 border-slate-200 pl-4 py-2">
              {repair.statusHistory.map((history: any) => (
                <div key={history.id} className="relative">
                  <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-slate-400"></div>
                  <p className="text-sm font-medium">{history.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500">{format(new Date(history.changedAt), 'dd MMM yyyy, HH:mm')} par {history.changedBy.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Col 2 */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={generatePDF} className="w-full" variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimer le ticket
            </Button>
            
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm font-medium">Mettre à jour le statut</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECU">Reçu</SelectItem>
                  <SelectItem value="DIAGNOSTIC">En diagnostic</SelectItem>
                  <SelectItem value="EN_ATTENTE_CLIENT">Attente validation</SelectItem>
                  <SelectItem value="EN_COURS">En cours de réparation</SelectItem>
                  <SelectItem value="REPARE">Réparé</SelectItem>
                  <SelectItem value="LIVRE">Livré au client</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={status === repair.status || isUpdating} className="w-full">
                <Save className="w-4 h-4 mr-2" /> {isUpdating ? 'Sauvegarde...' : 'Enregistrer'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium text-base">{repair.device.customer.fullName}</p>
            <p>{repair.device.customer.phone1}</p>
            {repair.device.customer.phone2 && <p>{repair.device.customer.phone2}</p>}
            <p className="text-slate-500">{repair.device.customer.email}</p>
            <p className="mt-2 text-slate-500">{repair.device.customer.address}</p>
            <Button variant="secondary" className="w-full mt-4">
              <MessageSquare className="w-4 h-4 mr-2" />
              Notification WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
