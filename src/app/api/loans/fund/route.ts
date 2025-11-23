import { prisma } from '@/lib/prisma';
import { fundLoanSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = fundLoanSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const { loanId, lenderAddress, fundingTx } = result.data;

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

    return successResponse(loan);
  } catch (error) {
    console.error('Error funding loan:', error);
    return errorResponse('Internal Server Error');
  }
}
