import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant days API route on server side');
}

// GET /api/plants/[id]/days - Get all days for a specific plant
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plant days on client side');
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

    // Get all days for this plant
    const days = db.prepare(`
      SELECT 
        pd.*,
        julianday(pd.date) - julianday(?) + 1 as day_number
      FROM plant_days pd
      WHERE pd.plant_id = ?
      ORDER BY pd.date
    `).all(plant.start_date, plantId);

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

    return new Response(JSON.stringify({ days: daysWithFertilizers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plant days:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/plants/[id]/days - Add a new day entry to a plant
export async function POST(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create plant day on client side');
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

    // Validate date
    if (!data.date) {
      return new Response(JSON.stringify({ error: "Datum ist erforderlich" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate day number
    const dayNumber = db.prepare(`
      SELECT julianday(?) - julianday(?) + 1 as day_number
    `).get(data.date, plant.start_date).day_number;

    // Check if day already exists
    const existingDay = db.prepare(
      "SELECT * FROM plant_days WHERE plant_id = ? AND date = ?"
    ).get(plantId, data.date);

    if (existingDay) {
      return new Response(JSON.stringify({ 
        error: "Ein Eintrag für dieses Datum existiert bereits",
        existingDay
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the day entry
    const insertDay = db.prepare(`
      INSERT INTO plant_days (
        plant_id,
        date,
        day_number,
        watered,
        topped,
        ph_value,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertDay.run(
      plantId,
      data.date,
      dayNumber,
      data.watered ? 1 : 0,
      data.topped ? 1 : 0,
      data.ph_value || null,
      data.notes || null
    );

    if (!result.lastInsertRowid) {
      throw new Error('Failed to create day entry');
    }

    const dayId = result.lastInsertRowid;

    // Add fertilizers if provided
    if (data.fertilizers && Array.isArray(data.fertilizers) && data.fertilizers.length > 0) {
      const insertFertilizer = db.prepare(`
        INSERT INTO fertilizer_usage (
          plant_day_id,
          fertilizer_name,
          amount
        ) VALUES (?, ?, ?)
      `);

      for (const fertilizer of data.fertilizers) {
        insertFertilizer.run(
          dayId,
          fertilizer.name,
          fertilizer.amount || null
        );
      }
    }

    // Get the created day with fertilizers
    const createdDay = db.prepare(`
      SELECT * FROM plant_days WHERE id = ?
    `).get(dayId);

    const fertilizers = db.prepare(`
      SELECT * FROM fertilizer_usage WHERE plant_day_id = ?
    `).all(dayId);

    return new Response(JSON.stringify({ 
      day: {
        ...createdDay,
        fertilizers
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating plant day:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
