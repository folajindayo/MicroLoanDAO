import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loanId, repaymentTx } = body;

    if (!loanId || !repaymentTx) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { borrower: true }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Calculate reputation impact
    // Simple logic: if repaid, +10 points. 
    // (Real logic would check if on time).
    // Assuming repaidAt is now.
    
    const now = new Date();
    const wasLate = loan.fundedAt && (now.getTime() > loan.fundedAt.getTime() + loan.duration * 1000);
    const pointsChange = wasLate ? -5 : 10;

    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'REPAID',
        repaidAt: now,
        repaymentTx,
        borrower: {
            update: {
                reputationScore: {
                    increment: pointsChange
                }
            }
        }
      },
      include: { borrower: true }
    });

    return NextResponse.json(updatedLoan);
  } catch (error) {
    console.error('Error repaying loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

