import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return errorResponse('Address is required', 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        loans: {
          orderBy: { createdAt: 'desc' }
        },
        fundedLoans: {
            orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!user) {
      return successResponse({ reputationScore: 100, loans: [], fundedLoans: [] });
    }

    return successResponse(user);
  } catch (error) {
    console.error('Error fetching history:', error);
    return errorResponse('Internal Server Error');
  }
}

