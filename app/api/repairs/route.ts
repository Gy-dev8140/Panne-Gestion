import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customer, device, repair } = body;

    // Generate Dossier Number: format ITB-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await db.repairOrder.count({
      where: { dossierNumber: { startsWith: `ITB-${year}-` } }
    });
    const dossierNumber = `ITB-${year}-${String(count + 1).padStart(4, '0')}`;

    // Use Prisma transaction to create all entities atomically
    const newRepair = await db.$transaction(async (tx) => {
      // 1. Create or Find Customer
      // For simplicity, we create a new one each time in this boilerplate
      const newCustomer = await tx.customer.create({
        data: {
          fullName: customer.fullName,
          phone1: customer.phone1,
          phone2: customer.phone2,
          address: customer.address,
          email: customer.email,
        }
      });

      // 2. Create Device
      const newDevice = await tx.device.create({
        data: {
          customerId: newCustomer.id,
          category: device.category,
          brand: device.brand,
          model: device.model,
          serialNumber: device.serialNumber,
          physicalCondition: device.physicalCondition,
        }
      });

      // 3. Create Repair Order
      const newRepairOrder = await tx.repairOrder.create({
        data: {
          dossierNumber: dossierNumber,
          deviceId: newDevice.id,
          description: repair.description,
          urgency: repair.urgency,
          accessories: JSON.stringify(repair.accessories || []),
          createdById: session.user.id,
          status: 'RECU'
        }
      });

      // 4. Create initial status history
      await tx.repairStatusHistory.create({
        data: {
          repairOrderId: newRepairOrder.id,
          status: 'RECU',
          changedById: session.user.id,
        }
      });

      return newRepairOrder;
    });

    return NextResponse.json(newRepair);
  } catch (error) {
    console.error('Failed to create repair order:', error);
    return NextResponse.json({ error: 'Failed to create repair order' }, { status: 500 });
  }
}
