import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
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
      return NextResponse.json({ reputationScore: 100, loans: [], fundedLoans: [] });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

