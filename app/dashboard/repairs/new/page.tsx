'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

const ACCESSORIES_LIST = [
  { id: 'Chargeur', label: 'Chargeur' },
  { id: 'Batterie', label: 'Batterie' },
  { id: 'Souris', label: 'Souris' },
  { id: 'Clavier', label: 'Clavier' },
  { id: 'Sacoche', label: 'Sacoche' },
  { id: 'Cable USB', label: 'Câble USB' },
  { id: 'Autre', label: 'Autre' },
];

const formSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2, 'Le nom est requis'),
    phone1: z.string().min(8, 'Le téléphone est requis'),
    phone2: z.string().optional(),
    address: z.string().min(2, 'L\'adresse est requise'),
    email: z.string().email('Email Invalide').optional().or(z.literal('')),
  }),
  device: z.object({
    category: z.string().min(1, 'La catégorie est requise'),
    brand: z.string().min(1, 'La marque est requise'),
    model: z.string().min(1, 'Le modèle est requis'),
    serialNumber: z.string().optional(),
    physicalCondition: z.string().min(1, 'L\'état physique est requis'),
  }),
  repair: z.object({
    description: z.string().min(5, 'Une description détaillée est requise'),
    urgency: z.string(),
    accessories: z.array(z.string()),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRepairOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: { fullName: '', phone1: '', phone2: '', address: '', email: '' },
      device: { category: '', brand: '', model: '', serialNumber: '', physicalCondition: 'Bon état' },
      repair: { description: '', urgency: 'MOYEN', accessories: [] },
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      
      toast.success(`Dossier créé avec succès: ${json.dossierNumber}`);
      router.push('/dashboard/repairs');
      router.refresh();
    } catch (error) {
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Nouveau Dossier de Réparation</h2>
        <p className="text-muted-foreground">Enregistrement d'un appareil client.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Section */}
        <Card>
          <CardHeader>
            <CardTitle>1. Informations Client</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom complet *</Label>
              <Input {...form.register('customer.fullName')} placeholder="Jean Dupont" />
              {form.formState.errors.customer?.fullName && <p className="text-sm text-red-500">{form.formState.errors.customer.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Téléphone Principal *</Label>
              <Input {...form.register('customer.phone1')} placeholder="06 12 34 56 78" />
              {form.formState.errors.customer?.phone1 && <p className="text-sm text-red-500">{form.formState.errors.customer.phone1.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Téléphone Secondaire</Label>
              <Input {...form.register('customer.phone2')} placeholder="07 00 00 00 00" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...form.register('customer.email')} placeholder="jean.dupont@email.com" />
              {form.formState.errors.customer?.email && <p className="text-sm text-red-500">{form.formState.errors.customer.email.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Adresse *</Label>
              <Input {...form.register('customer.address')} placeholder="123 rue de Paris, 75000" />
              {form.formState.errors.customer?.address && <p className="text-sm text-red-500">{form.formState.errors.customer.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Device Section */}
        <Card>
          <CardHeader>
            <CardTitle>2. Informations Appareil</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Controller
                name="device.category"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDINATEUR_PORTABLE">Ordinateur portable</SelectItem>
                      <SelectItem value="ORDINATEUR_BUREAU">Ordinateur de bureau</SelectItem>
                      <SelectItem value="IMPRIMANTE">Imprimante</SelectItem>
                      <SelectItem value="TELEPHONE">Téléphone</SelectItem>
                      <SelectItem value="TABLETTE">Tablette</SelectItem>
                      <SelectItem value="RESEAU">Réseau</SelectItem>
                      <SelectItem value="AUTRE">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.device?.category && <p className="text-sm text-red-500">{form.formState.errors.device.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Marque *</Label>
              <Input {...form.register('device.brand')} placeholder="HP, Dell, Apple..." />
              {form.formState.errors.device?.brand && <p className="text-sm text-red-500">{form.formState.errors.device.brand.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Modèle *</Label>
              <Input {...form.register('device.model')} placeholder="Spectre x360..." />
            </div>
            <div className="space-y-2">
              <Label>Numéro de série</Label>
              <Input {...form.register('device.serialNumber')} placeholder="S/N..." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>État Physique de l'appareil *</Label>
              <Input {...form.register('device.physicalCondition')} placeholder="Ex: Rayures sur le capot, écran fêlé..." />
            </div>
          </CardContent>
        </Card>

        {/* Repair Info section */}
        <Card>
          <CardHeader>
            <CardTitle>3. Diagnostic & Accessoires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Description de la panne *</Label>
              <Textarea 
                {...form.register('repair.description')} 
                placeholder="Décrivez les symptômes remarqués par le client..." 
                className="min-h-[100px]"
              />
              {form.formState.errors.repair?.description && <p className="text-sm text-red-500">{form.formState.errors.repair.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Niveau d'urgence *</Label>
              <Select onValueChange={(val) => form.setValue('repair.urgency', val)} defaultValue="MOYEN">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAIBLE">Faible</SelectItem>
                  <SelectItem value="MOYEN">Moyen</SelectItem>
                  <SelectItem value="ELEVEE">Élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Accessoires déposés</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ACCESSORIES_LIST.map((acc) => (
                  <div key={acc.id} className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      checked={form.watch('repair.accessories')?.includes(acc.id)}
                      onCheckedChange={(checked) => {
                        const current = form.watch('repair.accessories') || [];
                        if (checked) {
                          form.setValue('repair.accessories', [...current, acc.id]);
                        } else {
                          form.setValue('repair.accessories', current.filter((v) => v !== acc.id));
                        }
                      }}
                    />
                    <div className="space-y-1 leading-none">
                      <Label className="font-normal cursor-pointer text-sm">
                        {acc.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pb-12">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Générer le Dossier ITB'}
          </Button>
        </div>
      </form>
    </div>
  );
}
