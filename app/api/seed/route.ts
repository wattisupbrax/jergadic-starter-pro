import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-data';

export async function POST(request: NextRequest) {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Database seeding is only allowed in development mode' },
        { status: 403 }
      );
    }

    const result = await seedDatabase();
    
    return NextResponse.json({
      message: 'Database seeded successfully',
      result
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to seed the database',
    note: 'Only available in development mode'
  });
}