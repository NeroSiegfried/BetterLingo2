import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionToken, languageId, lessonId, completed } = await req.json();

    // Verify session
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date() || session.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update or create lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_languageId_lessonId: {
          userId,
          languageId,
          lessonId,
        },
      },
      update: {
        status: completed ? 'completed' : 'current',
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        languageId,
        lessonId,
        status: completed ? 'completed' : 'current',
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
