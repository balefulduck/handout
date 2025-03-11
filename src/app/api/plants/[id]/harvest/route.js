import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant harvest API route on server side');
}

// GET /api/plants/[id]/harvest - Get harvest data for a specific plant
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch harvest data on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const plantId = params.id;

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

    // Check if plant exists and belongs to user
    const plant = db.prepare(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?"
    ).get(plantId, user.id);

    if (!plant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get harvest data for the plant
    const harvest = db.prepare(
      "SELECT * FROM harvests WHERE plant_id = ?"
    ).get(plantId);

    return new Response(JSON.stringify({ harvest }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching harvest data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/plants/[id]/harvest - Create harvest data for a plant
export async function POST(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create harvest data on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const plantId = params.id;
    const data = await request.json();

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

    // Check if plant exists and belongs to user
    const plant = db.prepare(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?"
    ).get(plantId, user.id);

    if (!plant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if harvest data already exists for this plant
    const existingHarvest = db.prepare(
      "SELECT * FROM harvests WHERE plant_id = ?"
    ).get(plantId);

    if (existingHarvest) {
      return new Response(JSON.stringify({ error: "Erntedaten existieren bereits für diese Pflanze" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert harvest data
    const insertHarvest = db.prepare(`
      INSERT INTO harvests (
        plant_id, 
        consumption_material, 
        consumption_method, 
        description, 
        bud_density, 
        trichome_color, 
        curing_begin, 
        curing_end, 
        dry_weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertHarvest.run(
      plantId,
      data.consumption_material,
      data.consumption_method,
      data.description,
      data.bud_density,
      data.trichome_color,
      data.curing_begin,
      data.curing_end,
      data.dry_weight
    );

    // Update plant status to harvested
    const updatePlantStatus = db.prepare(
      "UPDATE plants SET status = 'harvested' WHERE id = ?"
    );
    updatePlantStatus.run(plantId);

    // Get the inserted harvest data
    const harvest = db.prepare(
      "SELECT * FROM harvests WHERE id = ?"
    ).get(result.lastInsertRowid);

    return new Response(JSON.stringify({ harvest }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating harvest data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/plants/[id]/harvest - Update harvest data for a plant
export async function PUT(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot update harvest data on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const plantId = params.id;
    const data = await request.json();

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

    // Check if plant exists and belongs to user
    const plant = db.prepare(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?"
    ).get(plantId, user.id);

    if (!plant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if harvest data exists for this plant
    const existingHarvest = db.prepare(
      "SELECT * FROM harvests WHERE plant_id = ?"
    ).get(plantId);

    if (!existingHarvest) {
      return new Response(JSON.stringify({ error: "Keine Erntedaten für diese Pflanze gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update harvest data
    const updateHarvest = db.prepare(`
      UPDATE harvests SET
        consumption_material = COALESCE(?, consumption_material),
        consumption_method = COALESCE(?, consumption_method),
        description = COALESCE(?, description),
        bud_density = COALESCE(?, bud_density),
        trichome_color = COALESCE(?, trichome_color),
        curing_begin = COALESCE(?, curing_begin),
        curing_end = COALESCE(?, curing_end),
        dry_weight = COALESCE(?, dry_weight)
      WHERE plant_id = ?
    `);

    updateHarvest.run(
      data.consumption_material || null,
      data.consumption_method || null,
      data.description || null,
      data.bud_density || null,
      data.trichome_color || null,
      data.curing_begin || null,
      data.curing_end || null,
      data.dry_weight || null,
      plantId
    );

    // Get the updated harvest data
    const harvest = db.prepare(
      "SELECT * FROM harvests WHERE plant_id = ?"
    ).get(plantId);

    return new Response(JSON.stringify({ harvest }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating harvest data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
