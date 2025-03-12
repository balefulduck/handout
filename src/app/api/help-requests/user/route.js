import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  db.pragma('journal_mode = WAL');
}

export async function GET(request) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Find user by session username
    const user = db.prepare("SELECT id FROM users WHERE username = ?").get(session.user.name);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Check if table exists
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='help_requests'").get();
    
    if (!tableExists) {
      return new Response(JSON.stringify({ helpRequests: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get help requests for the current user
    const helpRequests = db.prepare(`
      SELECT * FROM help_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(user.id);
    
    return new Response(JSON.stringify({ helpRequests }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET /api/help-requests/user:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
