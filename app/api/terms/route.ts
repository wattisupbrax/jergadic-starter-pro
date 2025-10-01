import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { termOperations, definitionOperations, userOperations } from '@/lib/db-operations';
import { createTermSchema } from '@/lib/validation-schemas';
import { checkAndAssignBadges, calculateUserReputation } from '@/lib/badge-system';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get('word');
    const region = searchParams.get('region');
    const random = searchParams.get('random');

    if (random === 'true') {
      const randomTerm = await termOperations.getRandomTerm(region || undefined);
      if (!randomTerm) {
        return NextResponse.json({ error: 'No terms found' }, { status: 404 });
      }
      
      // Get definitions for the random term
      const definitions = await definitionOperations.findByTermId(
        randomTerm._id.toString(),
        region || undefined
      );
      
      return NextResponse.json({
        term: randomTerm,
        definitions
      });
    }

    if (word) {
      const term = await termOperations.findByWord(word, region || undefined);
      if (!term) {
        return NextResponse.json({ error: 'Term not found' }, { status: 404 });
      }
      
      // Get definitions for this term
      const definitions = await definitionOperations.findByTermId(
        term._id.toString(),
        region || undefined
      );
      
      return NextResponse.json({
        term,
        definitions
      });
    }

    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
    
  } catch (error) {
    console.error('Terms GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTermSchema.parse(body);

    // Check if term already exists for this region
    const existingTerm = await termOperations.findByWord(validatedData.word, validatedData.region);
    
    let term;
    if (existingTerm) {
      term = existingTerm;
    } else {
      // Create new term
      term = await termOperations.create({
        word: validatedData.word,
        region: validatedData.region,
        tags: validatedData.tags,
        synonyms: validatedData.synonyms,
        authorId: userId
      });
    }

    // Create the definition
    const definition = await definitionOperations.create({
      termId: term._id,
      content: validatedData.definition,
      example: validatedData.example,
      authorId: userId,
      region: validatedData.region,
      votes: { up: 0, down: 0, score: 0 }
    });

    // Update user contributions
    if (!existingTerm) {
      await userOperations.updateContributions(userId, 'termsSubmitted', 1);
    }
    await userOperations.updateContributions(userId, 'definitionsSubmitted', 1);

    // Update reputation and check for new badges
    try {
      await calculateUserReputation(userId);
      await checkAndAssignBadges(userId);
    } catch (error) {
      console.error('Error updating reputation/badges after term submission:', error);
    }

    return NextResponse.json({
      message: 'Term and definition created successfully',
      term,
      definition,
      isNewTerm: !existingTerm
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Terms POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}