import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dichoOperations, userOperations } from '@/lib/db-operations';
import { z } from 'zod';

const CreateDichoSchema = z.object({
  termId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid term ID'),
  content: z.string().min(1).max(500),
  translation: z.string().max(500).optional(),
  region: z.enum(['Mexico', 'Spain', 'Argentina', 'Colombia', 'Venezuela', 'Peru', 'Chile', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Dominican Republic', 'Puerto Rico', 'Cuba', 'General']),
});

const GetDichosSchema = z.object({
  termId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid term ID'),
  region: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { termId, content, translation, region } = CreateDichoSchema.parse(body);

    // Create the dicho
    const dicho = await dichoOperations.create({
      termId,
      content,
      translation,
      authorId: userId,
      region,
      votes: { up: 0, down: 0, score: 0 },
      isActive: true,
    });

    // Update user contributions
    await userOperations.updateContributions(userId, 'dichosSubmitted', 1);

    return NextResponse.json({
      message: 'Dicho created successfully',
      dicho
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid dicho data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Dicho creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create dicho' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { termId, region } = GetDichosSchema.parse(queryParams);
    
    const dichos = await dichoOperations.findByTermId(termId, region);
    
    return NextResponse.json({
      dichos,
      termId,
      region: region || 'all',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Get dichos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dichos' },
      { status: 500 }
    );
  }
}