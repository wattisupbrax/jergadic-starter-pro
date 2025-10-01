import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import { Term, Definition } from '@/lib/models';

const TrendingQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  region: z.string().optional(),
  period: z.enum(['day', 'week', 'month', 'all']).optional().default('week'),
  type: z.enum(['terms', 'definitions', 'both']).optional().default('both')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { limit, region, period, type } = TrendingQuerySchema.parse(queryParams);
    
    await dbConnect();
    
    // Calculate date range based on period
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'all':
      default:
        periodStart.setFullYear(2020); // Far back enough
        break;
    }
    
    const results: any = {};
    
    if (type === 'terms' || type === 'both') {
      // Get trending terms (based on definitions added to them)
      const matchStage: any = {
        createdAt: { $gte: periodStart },
        isActive: true
      };
      
      if (region && region !== 'all') {
        matchStage.region = region;
      }
      
      const trendingTerms = await Definition.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: '$termId',
            definitionCount: { $sum: 1 },
            totalVotes: { $sum: '$votes.score' },
            avgScore: { $avg: '$votes.score' },
            latestActivity: { $max: '$createdAt' }
          }
        },
        { 
          $addFields: {
            trendingScore: { 
              $add: [
                { $multiply: ['$definitionCount', 2] }, // Weight new definitions higher
                { $multiply: ['$totalVotes', 0.5] },   // Include vote score
                { 
                  $divide: [
                    { $subtract: ['$latestActivity', periodStart] },
                    86400000 // Convert to days
                  ]
                }
              ]
            }
          }
        },
        { $sort: { trendingScore: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'terms',
            localField: '_id',
            foreignField: '_id',
            as: 'term'
          }
        },
        { $unwind: '$term' },
        {
          $project: {
            word: '$term.word',
            region: '$term.region',
            tags: '$term.tags',
            synonyms: '$term.synonyms',
            createdAt: '$term.createdAt',
            trendingScore: 1,
            definitionCount: 1,
            totalVotes: 1,
            avgScore: 1
          }
        }
      ]);
      
      results.terms = trendingTerms;
    }
    
    if (type === 'definitions' || type === 'both') {
      // Get trending definitions (based on recent votes)
      const matchStage: any = {
        createdAt: { $gte: periodStart },
        isActive: true,
        'votes.score': { $gt: 0 }
      };
      
      if (region && region !== 'all') {
        matchStage.region = region;
      }
      
      const trendingDefinitions = await Definition.find(matchStage)
        .sort({ 
          'votes.score': -1,
          createdAt: -1
        })
        .limit(limit)
        .populate('termId', 'word region tags')
        .select('content example votes region createdAt termId')
        .lean();
      
      results.definitions = trendingDefinitions;
    }
    
    return NextResponse.json({
      trending: results,
      period,
      region: region || 'all',
      limit,
      generatedAt: now.toISOString()
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Trending error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending content' },
      { status: 500 }
    );
  }
}