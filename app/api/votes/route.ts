import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { voteOperations, definitionOperations, userOperations, notificationOperations } from '@/lib/db-operations';
import { voteSchema } from '@/lib/validation-schemas';
import { headers } from 'next/headers';
import { z } from 'zod';
import { Definition } from '@/lib/models';
import { checkAndAssignBadges, calculateUserReputation } from '@/lib/badge-system';

// Rate limiting storage (in production, use Redis or similar)
const voteRateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_VOTES = 10; // Max 10 votes per minute per user

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = voteRateLimit.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    voteRateLimit.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_VOTES) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting check
    if (!checkRateLimit(userId)) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait before voting again.' 
      }, { status: 429 });
    }

    const body = await request.json();
    const { definitionId, type } = voteSchema.parse(body);

    // Check if user already voted on this definition
    const existingVote = await voteOperations.findUserVote(userId, definitionId);
    
    let voteChange = { up: 0, down: 0 };
    
    if (existingVote) {
      if (existingVote.type === type) {
        // User is removing their vote (clicking same button)
        await voteOperations.updateOrCreate(userId, definitionId, type);
        // Remove the vote by decrementing
        voteChange[existingVote.type] = -1;
      } else {
        // User is changing their vote
        await voteOperations.updateOrCreate(userId, definitionId, type);
        // Remove old vote and add new vote
        voteChange[existingVote.type] = -1;
        voteChange[type] = 1;
      }
    } else {
      // New vote
      await voteOperations.create({ userId, definitionId, type });
      voteChange[type] = 1;
    }

    // Update definition vote counts
    const updatedDefinition = await definitionOperations.updateVotes(
      definitionId,
      'up',
      voteChange.up
    );
    
    if (voteChange.down !== 0) {
      await definitionOperations.updateVotes(
        definitionId,
        'down',
        voteChange.down
      );
    }

    // Update user's vote contribution count
    if (Math.abs(voteChange.up) + Math.abs(voteChange.down) > 0) {
      await userOperations.updateContributions(userId, 'votesGiven', 1);
      
      // Update reputation and check for new badges
      try {
        await calculateUserReputation(userId);
        await checkAndAssignBadges(userId);
      } catch (error) {
        console.error('Error updating reputation/badges:', error);
      }
    }

    // Create notification for definition author if it's a positive vote
    if (voteChange.up > 0) {
      try {
        const definition = await Definition.findById(definitionId).lean();
        if (definition && definition.authorId !== userId) {
          await notificationOperations.createNotification(
            definition.authorId,
            'vote',
            '¡Tu definición recibió un voto positivo!',
            'Alguien valoró positivamente tu definición.',
            definitionId,
            'definition'
          );
        }
      } catch (error) {
        console.error('Error creating vote notification:', error);
        // Don't fail the vote if notification fails
      }
    }

    return NextResponse.json({
      message: 'Vote recorded successfully',
      vote: { type, definitionId },
      newVoteCounts: updatedDefinition?.votes,
      rateLimit: {
        remaining: RATE_LIMIT_MAX_VOTES - (voteRateLimit.get(userId)?.count || 0),
        resetTime: voteRateLimit.get(userId)?.resetTime
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const definitionId = searchParams.get('definitionId');
    
    if (!definitionId) {
      return NextResponse.json({ error: 'Definition ID required' }, { status: 400 });
    }

    const userVote = await voteOperations.findUserVote(userId, definitionId);
    
    return NextResponse.json({
      userVote: userVote ? userVote.type : null
    });
    
  } catch (error) {
    console.error('Get vote error:', error);
    return NextResponse.json(
      { error: 'Failed to get vote status' },
      { status: 500 }
    );
  }
}