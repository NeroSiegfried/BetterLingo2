import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all courses for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all courses for the user
    const courses = await prisma.userCourse.findMany({
      where: { userId: session.userId },
      orderBy: { enrolledAt: 'desc' },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Enroll in a new course
export async function POST(req: NextRequest) {
  try {
    const { languageId, level = 'beginner' } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or update course enrollment
    const course = await prisma.userCourse.upsert({
      where: {
        userId_languageId: {
          userId: session.userId,
          languageId,
        },
      },
      update: {
        level,
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        languageId,
        level,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Enroll course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
