import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing plants API route on server side');
}

// GET /api/plants - Get all plants for the current user
export async function GET() {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch plants on client side');
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

    // Get all plants for the user
    const plants = db.prepare(`
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
      WHERE p.user_id = ?
      ORDER BY p.id DESC
    `).all(user.id);
    
    // Fetch plant_days for each plant
    const plantsWithDays = plants.map(plant => {
      const days = db.prepare(`
        SELECT * FROM plant_days
        WHERE plant_id = ?
        ORDER BY date DESC
        LIMIT 10
      `).all(plant.id);
      
      return {
        ...plant,
        days: days
      };
    });

    return new Response(JSON.stringify({ plants: plantsWithDays }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/plants - Create a new plant
export async function POST(request) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create plant on client side');
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

    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Pflanzenname ist erforderlich" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use current date if start_date is not provided
    const startDate = data.start_date || new Date().toISOString().split('T')[0];

    // Insert the new plant
    const insertPlant = db.prepare(`
      INSERT INTO plants (
        user_id, 
        strain_id, 
        name, 
        breeder, 
        genetic_type, 
        expected_flowering_days, 
        start_date, 
        flowering_start_date, 
        status,
        substrate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertPlant.run(
      user.id,
      data.strain_id || null,
      data.name,
      data.breeder || null,
      data.genetic_type || null,
      data.expected_flowering_days || null,
      startDate,
      data.flowering_start_date || null,
      'active',
      data.substrate || null
    );

    if (!result.lastInsertRowid) {
      throw new Error('Failed to create plant');
    }

    // Get the newly created plant
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
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    return new Response(JSON.stringify({ plant }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating plant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
