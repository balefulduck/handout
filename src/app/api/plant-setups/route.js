import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant setups API route on server side');
}

// GET /api/plant-setups - Get all plant setups for the current user
export async function GET(request) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plant setups on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user ID from username
    const user = db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).get(session.user.name);

    if (!user) {
      return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all plant setups for this user
    let setups = [];
    try {
      setups = db.prepare(`
        SELECT * FROM plant_setups
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(user.id);
    } catch (err) {
      console.error('Error querying setups:', err);
      // Continue with empty setups array
    }

    // For each setup, get the plants associated with it
    const setupsWithPlants = setups.map(setup => {
      let plants = [];
      try {
        plants = db.prepare(`
          SELECT p.* FROM plants p
          JOIN plant_setup_mappings m ON p.id = m.plant_id
          WHERE m.setup_id = ?
          ORDER BY p.name
        `).all(setup.id);
      } catch (err) {
        console.error(`Error querying plants for setup ${setup.id}:`, err);
        // Continue with empty plants array
      }

      return {
        ...setup,
        plants
      };
    });

    return new Response(JSON.stringify({ setups: setupsWithPlants }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plant setups:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/plant-setups - Create a new plant setup
export async function POST(request) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create plant setup on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await request.json();

    // Validate input
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Name ist erforderlich" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get user ID from username
    const user = db.prepare(
      "SELECT id FROM users WHERE username = ?"
    ).get(session.user.name);

    if (!user) {
      return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the setup
    const insertSetup = db.prepare(`
      INSERT INTO plant_setups (
        user_id,
        name,
        description
      ) VALUES (?, ?, ?)
    `);

    const result = insertSetup.run(
      user.id,
      data.name,
      data.description || null
    );

    if (!result.lastInsertRowid) {
      throw new Error('Failed to create setup');
    }

    const setupId = result.lastInsertRowid;

    // Add plants to the setup if provided
    if (data.plantIds && Array.isArray(data.plantIds) && data.plantIds.length > 0) {
      const insertPlantMapping = db.prepare(`
        INSERT INTO plant_setup_mappings (
          setup_id,
          plant_id
        ) VALUES (?, ?)
      `);

      for (const plantId of data.plantIds) {
        try {
          insertPlantMapping.run(setupId, plantId);
        } catch (err) {
          console.error(`Failed to add plant ${plantId} to setup:`, err);
          // Continue adding other plants even if one fails
        }
      }
    }

    // Get the created setup with plants
    const setup = db.prepare("SELECT * FROM plant_setups WHERE id = ?").get(setupId);
    
    const plants = db.prepare(`
      SELECT p.* FROM plants p
      JOIN plant_setup_mappings m ON p.id = m.plant_id
      WHERE m.setup_id = ?
      ORDER BY p.name
    `).all(setupId);

    return new Response(JSON.stringify({ 
      setup: {
        ...setup,
        plants
      } 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating plant setup:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
