import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

// GET /api/phases - Get all phase content or filtered by phase
export async function GET(request) {
  try {
    // Get the phase parameter from the query string if it exists
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    
    let query = 'SELECT * FROM phase_content';
    let params = [];
    
    // Filter by phase if specified
    if (phase) {
      query += ' WHERE phase = ?';
      params.push(phase);
    }
    
    query += ' ORDER BY phase, content_type';
    
    try {
      // Check if the table exists
      const tableExists = db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='phase_content'"
      ).get();
      
      if (!tableExists) {
        return NextResponse.json(
          { error: 'Phase content data not available' },
          { status: 404 }
        );
      }
      
      // Execute the query
      const stmt = db.prepare(query);
      const results = stmt.all(...params);
      
      // Parse the JSON content_values field for each result
      const formattedResults = results.map(item => ({
        ...item,
        values: JSON.parse(item.content_values)
      }));
      
      // Group by phase for easier frontend consumption
      if (!phase) {
        const groupedByPhase = formattedResults.reduce((acc, item) => {
          if (!acc[item.phase]) {
            acc[item.phase] = [];
          }
          acc[item.phase].push(item);
          return acc;
        }, {});
        
        return NextResponse.json({ phases: groupedByPhase });
      }
      
      return NextResponse.json({ phaseContent: formattedResults });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch phase content: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching phase content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phase content: ' + error.message },
      { status: 500 }
    );
  }
}
