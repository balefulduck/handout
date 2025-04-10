import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setupId = params.id;
    
    // Open database connection using better-sqlite3
    const dbPath = path.join(process.cwd(), 'growguide.db');
    const db = new Database(dbPath);
    
    // Get all plants in the setup
    const plants = db.prepare(
      'SELECT p.* FROM plants p JOIN setup_plants sp ON p.id = sp.plant_id WHERE sp.setup_id = ? AND p.user_id = ?'
    ).all(setupId, session.user.id);
    
    if (plants.length === 0) {
      db.close();
      return NextResponse.json({ error: 'No plants found in this setup' }, { status: 404 });
    }
    
    // Get current date for flowering_start_date
    const floweringStartDate = new Date().toISOString().split('T')[0];
    
    // Start a transaction
    const transaction = db.transaction(() => {
      // Update each plant to start flowering
      for (const plant of plants) {
        // Only update plants that haven't started flowering yet
        if (!plant.flowering_start_date) {
          db.prepare(
            'UPDATE plants SET flowering_start_date = ? WHERE id = ? AND user_id = ?'
          ).run(floweringStartDate, plant.id, session.user.id);
        }
      }
    });
    
    // Execute the transaction
    try {
      transaction();
      
      // Close the database connection
      db.close();
      
      return NextResponse.json({ 
        success: true, 
        message: `Flowering started for ${plants.length} plants in the setup`,
        floweringStartDate
      });
    } catch (error) {
      // Close the database connection
      db.close();
      throw error;
    }
  } catch (error) {
    console.error('Error starting flowering for plants in setup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
