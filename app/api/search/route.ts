import { NextRequest, NextResponse } from 'next/server';
import { searchOperations } from '@/lib/db-operations';
import { z } from 'zod';

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  region: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  type: z.enum(['terms', 'all', 'autocomplete']).optional().default('all'),
  sortBy: z.enum(['relevance', 'score', 'date', 'popularity']).optional().default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const { q, region, tags, limit, offset, type, sortBy, sortOrder } = SearchQuerySchema.parse(queryParams);
    
    // Parse tags if provided
    const tagList = tags ? tags.split(',').filter(Boolean) : [];
    
    if (type === 'autocomplete') {
      const suggestions = await searchOperations.autocomplete(q, region, Math.min(limit, 10));
      return NextResponse.json({ suggestions });
    }
    
    if (type === 'terms') {
      const results = await searchOperations.globalSearch(q, region, limit);
      return NextResponse.json({
        query: q,
        region: region || 'all',
        results,
        total: results.terms.length + results.definitions.length
      });
    }
    
    // Enhanced search with filters and sorting
    const results = await searchOperations.globalSearch(q, region, limit);
    
    // Filter by tags if specified (client-side filtering for now)
    let filteredTerms = results.terms;
    let filteredDefinitions = results.definitions;
    
    if (tagList.length > 0) {
      filteredTerms = results.terms.filter(term => 
        term.tags && tagList.some(tag => term.tags.includes(tag))
      );
    }
    
    // Apply sorting
    const sortResults = (items: any[], sortBy: string, sortOrder: string) => {
      return items.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'score':
            comparison = (b.votes?.score || 0) - (a.votes?.score || 0);
            break;
          case 'date':
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
          case 'popularity':
            comparison = (b.votes?.up || 0) - (a.votes?.up || 0);
            break;
          case 'relevance':
          default:
            // Keep default ordering (text search relevance)
            comparison = 0;
            break;
        }
        
        return sortOrder === 'asc' ? -comparison : comparison;
      });
    };
    
    filteredTerms = sortResults(filteredTerms, sortBy, sortOrder);
    filteredDefinitions = sortResults(filteredDefinitions, sortBy, sortOrder);
    
    // Apply pagination
    const startIndex = offset;
    const endIndex = offset + limit;
    
    const paginatedTerms = filteredTerms.slice(startIndex, Math.min(endIndex, filteredTerms.length));
    const remainingLimit = limit - paginatedTerms.length;
    const paginatedDefinitions = remainingLimit > 0 
      ? filteredDefinitions.slice(0, remainingLimit)
      : [];
    
    return NextResponse.json({
      query: q,
      region: region || 'all',
      tags: tagList,
      results: {
        terms: paginatedTerms,
        definitions: paginatedDefinitions
      },
      total: filteredTerms.length + filteredDefinitions.length,
      pagination: {
        offset,
        limit,
        hasMore: (filteredTerms.length + filteredDefinitions.length) > endIndex
      },
      filters: {
        region: region || 'all',
        tags: tagList,
        sortBy,
        sortOrder
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}