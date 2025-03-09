import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plant day by ID API route on server side');
}

// GET /api/plants/[id]/days/[dayId] - Get a specific day entry
export async function GET(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plant day on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id: plantId, dayId } = params;

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

    // Get the day entry
    const day = db.prepare(`
      SELECT * FROM plant_days
      WHERE id = ? AND plant_id = ?
    `).get(dayId, plantId);

    if (!day) {
      return new Response(JSON.stringify({ error: "Tageseintrag nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get fertilizers for this day
    const fertilizers = db.prepare(`
      SELECT * FROM fertilizer_usage
      WHERE plant_day_id = ?
    `).all(dayId);

    return new Response(JSON.stringify({ 
      day: {
        ...day,
        fertilizers
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plant day:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT /api/plants/[id]/days/[dayId] - Update a specific day entry
export async function PUT(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot update plant day on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id: plantId, dayId } = params;
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

    // Check if day exists
    const existingDay = db.prepare(
      "SELECT * FROM plant_days WHERE id = ? AND plant_id = ?"
    ).get(dayId, plantId);

    if (!existingDay) {
      return new Response(JSON.stringify({ error: "Tageseintrag nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Begin transaction
    db.prepare('BEGIN TRANSACTION').run();

    try {
      // Update the day entry
      const updateDay = db.prepare(`
        UPDATE plant_days SET
          watered = COALESCE(?, watered),
          topped = COALESCE(?, topped),
          ph_value = ?,
          notes = ?
        WHERE id = ? AND plant_id = ?
      `);

      updateDay.run(
        data.watered !== undefined ? (data.watered ? 1 : 0) : null,
        data.topped !== undefined ? (data.topped ? 1 : 0) : null,
        data.ph_value !== undefined ? data.ph_value : existingDay.ph_value,
        data.notes !== undefined ? data.notes : existingDay.notes,
        dayId,
        plantId
      );

      // Handle fertilizers if provided
      if (data.fertilizers !== undefined) {
        // Delete existing fertilizers
        db.prepare('DELETE FROM fertilizer_usage WHERE plant_day_id = ?').run(dayId);

        // Add new fertilizers
        if (Array.isArray(data.fertilizers) && data.fertilizers.length > 0) {
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
      }

      // Commit transaction
      db.prepare('COMMIT').run();

      // Get the updated day with fertilizers
      const updatedDay = db.prepare(`
        SELECT * FROM plant_days WHERE id = ?
      `).get(dayId);

      const fertilizers = db.prepare(`
        SELECT * FROM fertilizer_usage WHERE plant_day_id = ?
      `).all(dayId);

      return new Response(JSON.stringify({ 
        day: {
          ...updatedDay,
          fertilizers
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Rollback transaction on error
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error updating plant day:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// DELETE /api/plants/[id]/days/[dayId] - Delete a specific day entry
export async function DELETE(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot delete plant day on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id: plantId, dayId } = params;

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

    // Check if day exists
    const existingDay = db.prepare(
      "SELECT * FROM plant_days WHERE id = ? AND plant_id = ?"
    ).get(dayId, plantId);

    if (!existingDay) {
      return new Response(JSON.stringify({ error: "Tageseintrag nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Begin transaction
    db.prepare('BEGIN TRANSACTION').run();

    try {
      // Delete fertilizers first (should cascade, but being explicit)
      db.prepare('DELETE FROM fertilizer_usage WHERE plant_day_id = ?').run(dayId);
      
      // Delete the day entry
      db.prepare('DELETE FROM plant_days WHERE id = ? AND plant_id = ?').run(dayId, plantId);
      
      // Commit transaction
      db.prepare('COMMIT').run();

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Rollback transaction on error
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting plant day:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
