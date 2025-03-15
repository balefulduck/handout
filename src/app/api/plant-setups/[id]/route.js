import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant setup detail API route on server side');
}

// GET /api/plant-setups/[id] - Get a specific plant setup
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plant setup on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const setupId = params.id;

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

    // Check if setup exists and belongs to user
    const setup = db.prepare(
      "SELECT * FROM plant_setups WHERE id = ? AND user_id = ?"
    ).get(setupId, user.id);

    if (!setup) {
      return new Response(JSON.stringify({ error: "Setup nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get plants in this setup
    const plants = db.prepare(`
      SELECT p.* FROM plants p
      JOIN plant_setup_mappings m ON p.id = m.plant_id
      WHERE m.setup_id = ?
      ORDER BY p.name
    `).all(setupId);

    // Get day entries for this setup
    const dayEntries = db.prepare(`
      SELECT * FROM setup_day_entries
      WHERE setup_id = ?
      ORDER BY date DESC
    `).all(setupId);

    // For each day entry, get fertilizer usage
    const dayEntriesWithFertilizers = dayEntries.map(entry => {
      const fertilizers = db.prepare(`
        SELECT * FROM fertilizer_usage
        WHERE setup_day_id = ?
      `).all(entry.id);

      return {
        ...entry,
        fertilizers
      };
    });

    return new Response(JSON.stringify({ 
      setup: {
        ...setup,
        plants,
        dayEntries: dayEntriesWithFertilizers
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plant setup:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/plant-setups/[id] - Update a plant setup
export async function PUT(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot update plant setup on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const setupId = params.id;
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

    // Check if setup exists and belongs to user
    const setup = db.prepare(
      "SELECT * FROM plant_setups WHERE id = ? AND user_id = ?"
    ).get(setupId, user.id);

    if (!setup) {
      return new Response(JSON.stringify({ error: "Setup nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the setup
    const updateSetup = db.prepare(`
      UPDATE plant_setups
      SET name = ?, description = ?
      WHERE id = ?
    `);

    updateSetup.run(
      data.name,
      data.description || null,
      setupId
    );

    // If plantIds array is provided, update the plants in the setup
    if (data.plantIds !== undefined) {
      if (!Array.isArray(data.plantIds)) {
        return new Response(JSON.stringify({ error: "plantIds muss ein Array sein" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // First remove all existing plant mappings
      db.prepare(`
        DELETE FROM plant_setup_mappings
        WHERE setup_id = ?
      `).run(setupId);

      // Then add the new plant mappings
      if (data.plantIds.length > 0) {
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
    }

    // Get the updated setup with plants
    const updatedSetup = db.prepare("SELECT * FROM plant_setups WHERE id = ?").get(setupId);
    
    const plants = db.prepare(`
      SELECT p.* FROM plants p
      JOIN plant_setup_mappings m ON p.id = m.plant_id
      WHERE m.setup_id = ?
      ORDER BY p.name
    `).all(setupId);

    return new Response(JSON.stringify({ 
      setup: {
        ...updatedSetup,
        plants
      } 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating plant setup:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE /api/plant-setups/[id] - Delete a plant setup
export async function DELETE(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot delete plant setup on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const setupId = params.id;

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

    // Check if setup exists and belongs to user
    const setup = db.prepare(
      "SELECT * FROM plant_setups WHERE id = ? AND user_id = ?"
    ).get(setupId, user.id);

    if (!setup) {
      return new Response(JSON.stringify({ error: "Setup nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the setup (cascade will delete mappings and day entries)
    db.prepare("DELETE FROM plant_setups WHERE id = ?").run(setupId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting plant setup:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
