import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const { status } = await req.json();

    const updatedRepairOrder = await db.$transaction(async (tx) => {
      const order = await tx.repairOrder.update({
        where: { id },
        data: { status }
      });

      await tx.repairStatusHistory.create({
        data: {
          repairOrderId: order.id,
          status,
          changedById: session.user.id,
        }
      });

      return order;
    });

    return NextResponse.json(updatedRepairOrder);
  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
