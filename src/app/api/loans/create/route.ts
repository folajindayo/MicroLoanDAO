import { prisma } from '@/lib/prisma';
import { createLoanSchema } from '@/lib/validation';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createLoanSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.errors[0].message, 400);
    }

    const { borrowerAddress, amount, purpose, duration, interestRate, creationTx, contractLoanId } = result.data;

    // Create or update user
    await prisma.user.upsert({
      where: { address: borrowerAddress },
      update: {},
      create: { address: borrowerAddress },
    });

    const loan = await prisma.loan.create({
      data: {
        borrowerAddress,
        amount,
        purpose,
        duration,
        interestRate: interestRate ?? 0,
        status: 'REQUESTED',
        creationTx,
        contractLoanId: contractLoanId ?? null,
      },
    });

    return successResponse(loan);
  } catch (error) {
    console.error('Error creating loan:', error);
    return errorResponse('Internal Server Error');
  }
}
