import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loanId, lenderAddress, fundingTx } = body;

    if (!loanId || !lenderAddress || !fundingTx) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create or update lender
    await prisma.user.upsert({
      where: { address: lenderAddress },
      update: {},
      create: { address: lenderAddress },
    });

    const loan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        lenderAddress,
        status: 'FUNDED',
        fundedAt: new Date(),
        fundingTx,
      },
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error funding loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

