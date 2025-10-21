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

    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: session.userId,
        languageId,
      },
      orderBy: { lessonId: 'asc' },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const { lessonId, status, score } = await req.json();

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_languageId_lessonId: {
          userId: session.userId,
          languageId,
          lessonId: parseInt(lessonId),
        },
      },
      update: {
        status,
        score: score || undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        languageId,
        lessonId: parseInt(lessonId),
        status,
        score: score || undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
