import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setupId = params.id;
    
    // Open database connection
    const db = await open({
      filename: path.join(process.cwd(), 'growguide.db'),
      driver: sqlite3.Database
    });
    
    // Get all plants in the setup
    const plants = await db.all(
      'SELECT p.* FROM plants p JOIN setup_plants sp ON p.id = sp.plant_id WHERE sp.setup_id = ? AND p.user_id = ?',
      [setupId, session.user.id]
    );
    
    if (plants.length === 0) {
      return NextResponse.json({ error: 'No plants found in this setup' }, { status: 404 });
    }
    
    // Get current date for flowering_start_date
    const floweringStartDate = new Date().toISOString().split('T')[0];
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Update each plant to start flowering
      for (const plant of plants) {
        // Only update plants that haven't started flowering yet
        if (!plant.flowering_start_date) {
          await db.run(
            'UPDATE plants SET flowering_start_date = ? WHERE id = ? AND user_id = ?',
            [floweringStartDate, plant.id, session.user.id]
          );
        }
      }
      
      // Commit the transaction
      await db.run('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: `Flowering started for ${plants.length} plants in the setup`,
        floweringStartDate
      });
    } catch (error) {
      // Rollback the transaction in case of error
      await db.run('ROLLBACK');
      throw error;
    } finally {
      // Close the database connection
      await db.close();
    }
  } catch (error) {
    console.error('Error starting flowering for plants in setup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
