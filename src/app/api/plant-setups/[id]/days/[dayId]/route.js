import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing setup day entry API route on server side');
}

// DELETE /api/plant-setups/[id]/days/[dayId] - Delete a specific day entry for a setup
export async function DELETE(request, { params }) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot delete setup day entry on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const setupId = params.id;
    const dayId = params.dayId;

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

    // Check if day entry exists and belongs to this setup
    const dayEntry = db.prepare(
      "SELECT * FROM setup_day_entries WHERE id = ? AND setup_id = ?"
    ).get(dayId, setupId);

    if (!dayEntry) {
      return new Response(JSON.stringify({ error: "Tageseintrag nicht gefunden" }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find all plant days that are linked to this setup day entry
    const plantDays = db.prepare(
      "SELECT * FROM plant_days WHERE setup_entry_id = ?"
    ).all(dayId);

    // Start a transaction to ensure data consistency
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // Delete any fertilizer usage entries for this setup day
      db.prepare(
        "DELETE FROM fertilizer_usage WHERE setup_day_id = ?"
      ).run(dayId);

      // For each plant day entry, delete associated fertilizer usage
      for (const plantDay of plantDays) {
        db.prepare(
          "DELETE FROM fertilizer_usage WHERE plant_day_id = ?"
        ).run(plantDay.id);
      }

      // Delete all plant day entries linked to this setup day
      db.prepare(
        "DELETE FROM plant_days WHERE setup_entry_id = ?"
      ).run(dayId);

      // Finally, delete the setup day entry itself
      db.prepare(
        "DELETE FROM setup_day_entries WHERE id = ?"
      ).run(dayId);

      // Commit the transaction
      db.prepare("COMMIT").run();

      return new Response(JSON.stringify({ 
        success: true,
        message: "Tageseintrag erfolgreich gelöscht",
        deletedPlantDays: plantDays.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Rollback transaction if something goes wrong
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting setup day entry:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
