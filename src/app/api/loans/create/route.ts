import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { borrowerAddress, amount, purpose, duration, interestRate, creationTx, contractLoanId } = body;

    if (!borrowerAddress || !amount || !purpose || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create or update user
    await prisma.user.upsert({
      where: { address: borrowerAddress },
      update: {},
      create: { address: borrowerAddress },
    });

    const loan = await prisma.loan.create({
      data: {
        borrowerAddress,
        amount: String(amount),
        purpose,
        duration: Number(duration),
        interestRate: Number(interestRate || 0), // Default to 0 if not provided
        status: 'REQUESTED',
        creationTx,
        contractLoanId: contractLoanId ? Number(contractLoanId) : null,
      },
    });

    return NextResponse.json(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
