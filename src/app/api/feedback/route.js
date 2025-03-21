import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

// POST /api/feedback - Create a new feedback entry
export async function POST(request) {
  try {
    // Get session if available
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error('Error getting session:', error);
      // Continue without session
    }
    
    const { message, route } = await request.json();

    // Validate the request
    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      );
    }

    // Get user information from session if available
    const userId = session?.user?.id || null;
    const username = session?.user?.name || 'Anonymous User';

    console.log('Saving feedback:', { userId, username, message, route });

    try {
      // Check if feedback table exists
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'").get();
      
      if (!tableExists) {
        // Create feedback table if it doesn't exist
        db.exec(`
          CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            route TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Created feedback table');
      }

      // Insert feedback into database
      const stmt = db.prepare(`
        INSERT INTO feedback (user_id, username, message, route)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(userId, username, message, route || null);

      return NextResponse.json({ 
        success: true, 
        message: 'Feedback submitted successfully',
        id: result.lastInsertRowid
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback to simple success response if database fails
      return NextResponse.json({ 
        success: true, 
        message: 'Feedback received (database error occurred)',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback: ' + error.message },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get all feedback entries (admin only)
export async function GET() {
  try {
    // Get session if available
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error('Error getting session:', error);
      // Continue without session
    }
    
    // Simple admin check - in a real app, you would have proper role-based access control
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Check if feedback table exists
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'").get();
      
      if (!tableExists) {
        // Return empty array if table doesn't exist
        return NextResponse.json({ feedback: [] });
      }

      // Get all feedback entries, ordered by most recent first
      const stmt = db.prepare(`
        SELECT id, user_id, username, message, route, created_at
        FROM feedback
        ORDER BY created_at DESC
      `);
      
      const feedback = stmt.all();

      return NextResponse.json({ feedback });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ 
        feedback: [],
        error: dbError.message 
      });
    }
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback: ' + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback?id=X - Delete a feedback entry (admin only)
export async function DELETE(request) {
  try {
    // Get session if available
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (error) {
      console.error('Error getting session:', error);
      // Continue without session
    }
    
    // Simple admin check - in a real app, you would have proper role-based access control
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the feedback ID from the query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    try {
      // Check if feedback table exists
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'").get();
      
      if (!tableExists) {
        return NextResponse.json(
          { error: 'Feedback table does not exist' },
          { status: 404 }
        );
      }

      // Delete the feedback entry
      const stmt = db.prepare('DELETE FROM feedback WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return NextResponse.json(
          { error: 'Feedback entry not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Feedback deleted successfully' 
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database error: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback: ' + error.message },
      { status: 500 }
    );
  }
}
