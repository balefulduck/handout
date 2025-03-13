import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing setup days API route on server side');
}

// GET /api/plant-setups/[id]/days - Get all day entries for a specific setup
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch setup days on client side');
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

    // Get all day entries for this setup
    const dayEntries = db.prepare(`
      SELECT * FROM setup_day_entries
      WHERE setup_id = ?
      ORDER BY date DESC
    `).all(setupId);

    // For each day entry, get fertilizer usage
    const dayEntriesWithFertilizers = dayEntries.map(day => {
      const fertilizers = db.prepare(`
        SELECT * FROM fertilizer_usage
        WHERE setup_day_id = ?
      `).all(day.id);

      return {
        ...day,
        fertilizers
      };
    });

    return new Response(JSON.stringify({ dayEntries: dayEntriesWithFertilizers }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching setup days:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/plant-setups/[id]/days - Add a day entry to all plants in a setup
export async function POST(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create setup day on client side');
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

    // Validate date
    if (!data.date) {
      return new Response(JSON.stringify({ error: "Datum ist erforderlich" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if day entry already exists for this date
    const existingDayEntry = db.prepare(
      "SELECT * FROM setup_day_entries WHERE setup_id = ? AND date = ?"
    ).get(setupId, data.date);

    if (existingDayEntry) {
      return new Response(JSON.stringify({ 
        error: "Ein Eintrag für dieses Datum existiert bereits",
        existingDayEntry
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create the setup day entry
    const insertDayEntry = db.prepare(`
      INSERT INTO setup_day_entries (
        setup_id,
        date,
        watered,
        topped,
        ph_value,
        watering_amount,
        temperature,
        humidity,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertDayEntry.run(
      setupId,
      data.date,
      data.watered ? 1 : 0,
      data.topped ? 1 : 0,
      data.ph_value || null,
      data.watering_amount || null,
      data.temperature || null,
      data.humidity || null,
      data.notes || null
    );

    if (!result.lastInsertRowid) {
      throw new Error('Failed to create setup day entry');
    }

    const setupDayId = result.lastInsertRowid;

    // Add fertilizers if provided
    if (data.fertilizers && Array.isArray(data.fertilizers) && data.fertilizers.length > 0) {
      const insertFertilizer = db.prepare(`
        INSERT INTO fertilizer_usage (
          setup_day_id,
          fertilizer_name,
          amount
        ) VALUES (?, ?, ?)
      `);

      for (const fertilizer of data.fertilizers) {
        if (fertilizer.name) {
          insertFertilizer.run(
            setupDayId,
            fertilizer.name,
            fertilizer.amount || null
          );
        }
      }
    }

    // Get plants in this setup
    const plants = db.prepare(`
      SELECT p.* FROM plants p
      JOIN plant_setup_mappings m ON p.id = m.plant_id
      WHERE m.setup_id = ?
    `).all(setupId);

    // Create individual plant day entries for each plant in the setup
    const plantDays = [];
    for (const plant of plants) {
      // Calculate day number for this plant
      const dayNumber = db.prepare(`
        SELECT julianday(?) - julianday(?) + 1 as day_number
      `).get(data.date, plant.start_date).day_number;

      // Check if plant already has an entry for this date
      const existingPlantDay = db.prepare(
        "SELECT * FROM plant_days WHERE plant_id = ? AND date = ?"
      ).get(plant.id, data.date);

      if (existingPlantDay) {
        console.log(`Plant ${plant.id} already has an entry for ${data.date}, skipping`);
        continue;
      }

      // Create plant day entry
      const insertPlantDay = db.prepare(`
        INSERT INTO plant_days (
          plant_id,
          date,
          day_number,
          watered,
          topped,
          ph_value,
          watering_amount,
          temperature,
          humidity,
          notes,
          setup_entry_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const plantDayResult = insertPlantDay.run(
        plant.id,
        data.date,
        dayNumber,
        data.watered ? 1 : 0,
        data.topped ? 1 : 0,
        data.ph_value || null,
        data.watering_amount || null,
        data.temperature || null,
        data.humidity || null,
        data.notes || null,
        setupDayId
      );

      if (plantDayResult.lastInsertRowid) {
        const plantDayId = plantDayResult.lastInsertRowid;
        
        // Add fertilizers for this plant day
        if (data.fertilizers && Array.isArray(data.fertilizers) && data.fertilizers.length > 0) {
          const insertFertilizer = db.prepare(`
            INSERT INTO fertilizer_usage (
              plant_day_id,
              fertilizer_name,
              amount
            ) VALUES (?, ?, ?)
          `);

          for (const fertilizer of data.fertilizers) {
            if (fertilizer.name) {
              insertFertilizer.run(
                plantDayId,
                fertilizer.name,
                fertilizer.amount || null
              );
            }
          }
        }

        // Add the plant day to the result
        const plantDay = db.prepare("SELECT * FROM plant_days WHERE id = ?").get(plantDayId);
        plantDays.push(plantDay);
      }
    }

    // Get the created day entry with fertilizers
    const dayEntry = db.prepare("SELECT * FROM setup_day_entries WHERE id = ?").get(setupDayId);
    
    const fertilizers = db.prepare(`
      SELECT * FROM fertilizer_usage
      WHERE setup_day_id = ?
    `).all(setupDayId);

    return new Response(JSON.stringify({ 
      dayEntry: {
        ...dayEntry,
        fertilizers
      },
      affectedPlants: plants.length,
      createdPlantDays: plantDays.length
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating setup day entry:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
