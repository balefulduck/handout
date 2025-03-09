import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant by ID API route on server side');
}

// GET /api/plants/[id] - Get a specific plant with all its days
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plant on client side');
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

    // Get the plant with calculated fields
    const plant = db.prepare(`
      SELECT 
        p.*,
        s.name as strain_name,
        s.type as strain_type,
        CASE 
          WHEN p.flowering_start_date IS NOT NULL 
          THEN julianday('now') - julianday(p.flowering_start_date) 
          ELSE NULL 
        END as flowering_days,
        julianday('now') - julianday(p.start_date) as age_days
      FROM plants p
      LEFT JOIN strains s ON p.strain_id = s.id
      WHERE p.id = ? AND p.user_id = ?
    `).get(plantId, user.id);

    if (!plant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all days for this plant
    const days = db.prepare(`
      SELECT 
        pd.*,
        julianday(pd.date) - julianday(p.start_date) + 1 as day_number
      FROM plant_days pd
      JOIN plants p ON pd.plant_id = p.id
      WHERE pd.plant_id = ?
      ORDER BY pd.date
    `).all(plantId);

    // For each day, get fertilizer usage
    const daysWithFertilizers = days.map(day => {
      const fertilizers = db.prepare(`
        SELECT * FROM fertilizer_usage
        WHERE plant_day_id = ?
      `).all(day.id);

      return {
        ...day,
        fertilizers
      };
    });

    return new Response(JSON.stringify({ 
      plant,
      days: daysWithFertilizers
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/plants/[id] - Update plant details
export async function PUT(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot update plant on client side');
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
    const existingPlant = db.prepare(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?"
    ).get(plantId, user.id);

    if (!existingPlant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the plant
    const updatePlant = db.prepare(`
      UPDATE plants SET
        name = COALESCE(?, name),
        breeder = COALESCE(?, breeder),
        genetic_type = COALESCE(?, genetic_type),
        expected_flowering_days = COALESCE(?, expected_flowering_days),
        start_date = COALESCE(?, start_date),
        flowering_start_date = ?,
        status = COALESCE(?, status)
      WHERE id = ? AND user_id = ?
    `);

    updatePlant.run(
      data.name || null,
      data.breeder || null,
      data.genetic_type || null,
      data.expected_flowering_days || null,
      data.start_date || null,
      data.flowering_start_date !== undefined ? data.flowering_start_date : existingPlant.flowering_start_date,
      data.status || null,
      plantId,
      user.id
    );

    // Get the updated plant
    const updatedPlant = db.prepare(`
      SELECT 
        p.*,
        s.name as strain_name,
        s.type as strain_type,
        CASE 
          WHEN p.flowering_start_date IS NOT NULL 
          THEN julianday('now') - julianday(p.flowering_start_date) 
          ELSE NULL 
        END as flowering_days,
        julianday('now') - julianday(p.start_date) as age_days
      FROM plants p
      LEFT JOIN strains s ON p.strain_id = s.id
      WHERE p.id = ?
    `).get(plantId);

    return new Response(JSON.stringify({ plant: updatedPlant }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating plant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE /api/plants/[id] - Delete a plant
export async function DELETE(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot delete plant on client side');
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
    const existingPlant = db.prepare(
      "SELECT * FROM plants WHERE id = ? AND user_id = ?"
    ).get(plantId, user.id);

    if (!existingPlant) {
      return new Response(JSON.stringify({ error: "Pflanze nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the plant (cascade delete will handle related records)
    const deletePlant = db.prepare(
      "DELETE FROM plants WHERE id = ? AND user_id = ?"
    );

    deletePlant.run(plantId, user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting plant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
