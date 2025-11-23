import { prisma } from '@/lib/prisma';
import { repayLoanSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = repayLoanSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const { loanId, repaymentTx } = result.data;

    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: { borrower: true }
    });

    if (!loan) {
      return errorResponse('Loan not found', 404);
    }

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

    return successResponse(updatedLoan);
  } catch (error) {
    console.error('Error repaying loan:', error);
    return errorResponse('Internal Server Error');
  }
}
