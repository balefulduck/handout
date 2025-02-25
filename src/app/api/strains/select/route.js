import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from '@/lib/db';
import strainData from '@/data/strains.json';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing strains selection route on server side');
}

export async function GET() {
  // First, let's sync the database with our JSON data
  const transaction = db.transaction(() => {
    // Clear existing strains
    db.prepare("DELETE FROM strains").run();
    
    // Insert strains from JSON with all properties
    const insert = db.prepare(`
      INSERT INTO strains (id, name, type, thc, cbd, flowering_time, description, effects)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    strainData.strains.forEach(strain => {
      insert.run(
        strain.id,
        strain.name,
        strain.type,
        strain.thc,
        strain.cbd,
        strain.flowering_time,
        strain.description,
        JSON.stringify(strain.effects) // Store effects array as JSON string
      );
    });
  });

  // Execute the sync
  transaction();

  // Get all strains for verification
  const strains = db.prepare("SELECT * FROM strains").all();
  return new Response(JSON.stringify({ 
    message: "Route is working, strains synced",
    strains: strains
  }));
}

export async function POST(request) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot handle strain selection on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();
    console.log('Received strain selection:', data);

    if (!Array.isArray(data.selectedStrains) || data.selectedStrains.length !== 3) {
      return new Response(JSON.stringify({ error: "Bitte wählen Sie genau 3 Sorten aus" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Debug: Get the actual user from database by username
    console.log('Looking up user:', session.user.name);
    const dbUser = db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).get(session.user.name);
    console.log('Database user:', dbUser);

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found in database" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // First clear existing selections
    db.prepare(
      "DELETE FROM user_strains WHERE user_id = ?"
    ).run(dbUser.id);

    // Then insert new selections
    const insertStrain = db.prepare(
      "INSERT INTO user_strains (user_id, strain_id) VALUES (?, ?)"
    );

    for (const strainId of data.selectedStrains) {
      insertStrain.run(dbUser.id, strainId);
    }

    // Update onboarding status
    db.prepare(
      "UPDATE users SET onboarding_completed = 1 WHERE id = ?"
    ).run(dbUser.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error saving strain selection:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
