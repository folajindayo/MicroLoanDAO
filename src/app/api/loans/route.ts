import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    const loans = await prisma.loan.findMany({
      where: { status: 'REQUESTED' },
      orderBy: { createdAt: 'desc' },
      include: { borrower: true },
    });

    return successResponse(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return errorResponse('Internal Server Error');
  }
}

