import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { languageId: string } }
) {
  try {
    const sessionToken = req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { languageId } = params;

    const words = await prisma.wordBank.findMany({
      where: {
        userId: session.userId,
        languageId,
      },
      orderBy: [
        { status: 'desc' }, // active first
        { timesUsed: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ words });
  } catch (error) {
    console.error('Get word bank error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
