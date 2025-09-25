import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { commentOperations, userOperations } from '@/lib/db-operations';
import { z } from 'zod';

const CreateCommentSchema = z.object({
  definitionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid definition ID'),
  content: z.string().min(1).max(1000),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID').optional(),
});

const GetCommentsSchema = z.object({
  definitionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid definition ID'),
  parentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent ID').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { definitionId, content, parentId } = CreateCommentSchema.parse(body);

    // Create the comment
    const comment = await commentOperations.create({
      definitionId,
      userId,
      content,
      parentId: parentId || null,
      replies: [],
      votes: { up: 0, down: 0, score: 0 },
      isActive: true,
    });

    // Update parent comment if this is a reply
    if (parentId) {
      // Add this comment ID to parent's replies array
      // This would require a new operation in commentOperations
    }

    // Update user contributions
    await userOperations.updateContributions(userId, 'commentsPosted', 1);

    return NextResponse.json({
      message: 'Comment created successfully',
      comment
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Comment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { definitionId, parentId } = GetCommentsSchema.parse(queryParams);
    
    const comments = await commentOperations.findByDefinitionId(definitionId, parentId);
    
    return NextResponse.json({
      comments,
      definitionId,
      parentId: parentId || null,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}