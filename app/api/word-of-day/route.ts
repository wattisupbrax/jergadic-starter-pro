import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Term, Definition } from '@/lib/models';

const WordOfDayQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD format, defaults to today
  region: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { date, region } = WordOfDayQuerySchema.parse(queryParams);
    
    await dbConnect();
    
    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date();
    const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Create a deterministic seed based on the date for consistent daily selection
    const dateSeed = targetDate.getFullYear() * 10000 + 
                    (targetDate.getMonth() + 1) * 100 + 
                    targetDate.getDate();
    
    // Build match criteria
    const matchCriteria: any = {
      isActive: true,
      // Ensure the term has at least one definition
      $expr: { $gt: [{ $size: '$definitions' }, 0] }
    };
    
    if (region && region !== 'all') {
      matchCriteria.region = region;
    }
    
    // Get a deterministic "random" term based on the date
    const totalTerms = await Term.countDocuments(matchCriteria);
    
    if (totalTerms === 0) {
      return NextResponse.json(
        { error: 'No terms available for word of the day' },
        { status: 404 }
      );
    }
    
    // Use date seed to calculate a consistent skip value
    const skipCount = dateSeed % totalTerms;
    
    const wordOfDayTerm = await Term.findOne(matchCriteria)
      .skip(skipCount)
      .lean();
    
    if (!wordOfDayTerm) {
      return NextResponse.json(
        { error: 'Could not select word of the day' },
        { status: 404 }
      );
    }
    
    // Get the best definition for this term
    const bestDefinition = await Definition.findOne({
      termId: wordOfDayTerm._id,
      isActive: true
    })
      .sort({ 'votes.score': -1, createdAt: -1 })
      .lean();
    
    // Get additional stats
    const definitionCount = await Definition.countDocuments({
      termId: wordOfDayTerm._id,
      isActive: true
    });
    
    const totalVotes = await Definition.aggregate([
      { $match: { termId: wordOfDayTerm._id, isActive: true } },
      { $group: { _id: null, totalUp: { $sum: '$votes.up' }, totalDown: { $sum: '$votes.down' } } }
    ]);
    
    const voteStats = totalVotes[0] || { totalUp: 0, totalDown: 0 };
    
    // Format response
    const wordOfDay = {
      date: dateString,
      term: {
        _id: wordOfDayTerm._id,
        word: wordOfDayTerm.word,
        region: wordOfDayTerm.region,
        tags: wordOfDayTerm.tags,
        synonyms: wordOfDayTerm.synonyms,
        createdAt: wordOfDayTerm.createdAt
      },
      definition: bestDefinition ? {
        _id: bestDefinition._id,
        content: bestDefinition.content,
        example: bestDefinition.example,
        votes: bestDefinition.votes,
        region: bestDefinition.region,
        createdAt: bestDefinition.createdAt
      } : null,
      stats: {
        definitionCount,
        totalVotesUp: voteStats.totalUp,
        totalVotesDown: voteStats.totalDown,
        score: voteStats.totalUp - voteStats.totalDown
      },
      meta: {
        isRandomlySelected: true,
        seed: dateSeed,
        selectionMethod: 'deterministic_daily'
      }
    };
    
    return NextResponse.json({
      wordOfDay,
      region: region || 'all',
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Word of day error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch word of the day' },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint to manually set word of the day (admin only)
export async function POST(request: NextRequest) {
  try {
    // This would require admin authentication
    return NextResponse.json(
      { error: 'Manual word of day setting not implemented' },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set word of the day' },
      { status: 500 }
    );
  }
}