import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing selected strains route on server side');
}

export async function GET() {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch strains on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First get the user's ID from their username
    const user = db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).get(session.user.name);

    if (!user) {
      return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get selected strains for the user
    const strains = db.prepare(`
      SELECT s.* 
      FROM strains s
      JOIN user_strains us ON s.id = us.strain_id
      WHERE us.user_id = ?
    `).all(user.id);

    return new Response(JSON.stringify({ strains }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching selected strains:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
