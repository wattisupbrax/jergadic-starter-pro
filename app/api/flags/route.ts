import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { flagOperations } from '@/lib/db-operations';
import { z } from 'zod';

const CreateFlagSchema = z.object({
  targetType: z.enum(['term', 'definition', 'comment', 'dicho']),
  targetId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid target ID'),
  reason: z.enum([
    'inappropriate_content',
    'spam',
    'harassment',
    'hate_speech',
    'misinformation',
    'copyright_violation',
    'personal_information',
    'other'
  ]),
  customReason: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, reason, customReason } = CreateFlagSchema.parse(body);

    // Check if user already flagged this content
    const existingFlag = await flagOperations.checkExistingFlag(userId, targetType, targetId);
    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already flagged this content' },
        { status: 409 }
      );
    }
    
    // Create the flag
    const flag = await flagOperations.create({
      reporterId: userId,
      targetType,
      targetId,
      reason,
      customReason,
      status: 'pending',
    });

    return NextResponse.json({
      message: 'Content reported successfully',
      flagId: flag._id
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid flag data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Flag creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create flag' },
      { status: 500 }
    );
  }
}

// Only admins/moderators can view flags
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has admin/moderator role
    const userRole = sessionClaims?.metadata?.role || 'user';
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    const flags = await flagOperations.findByStatus(status, limit);

    return NextResponse.json({
      flags,
      status,
      total: flags.length
    });
    
  } catch (error) {
    console.error('Get flags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    );
  }
}