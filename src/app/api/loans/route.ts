import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const loans = await prisma.loan.findMany({
      where: { status: 'REQUESTED' },
      orderBy: { createdAt: 'desc' },
      include: { borrower: true },
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

