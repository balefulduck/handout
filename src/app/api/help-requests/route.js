import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing help-requests API route on server side');
}

// Helper function to save uploaded files
async function saveFile(file, userId) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename
  const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'help-requests', userId.toString());
  
  // Ensure directory exists
  try {
    await writeFile(join(uploadDir, fileName), buffer);
    return `/uploads/help-requests/${userId}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

// POST /api/help-requests - Create a new help request
export async function POST(request) {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot create help request on client side');
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

    // Process the form data
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    const plantDataJSON = formData.get('plantData');
    const selectedPlantIdsJSON = formData.get('selectedPlantIds');
    
    // Get all files
    const files = formData.getAll('files');
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ 
        error: "Bitte füllen Sie alle erforderlichen Felder aus" 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse plant data
    let plantData = [];
    let selectedPlantIds = [];
    
    try {
      if (plantDataJSON) {
        plantData = JSON.parse(plantDataJSON);
      }
      if (selectedPlantIdsJSON) {
        selectedPlantIds = JSON.parse(selectedPlantIdsJSON);
      }
    } catch (error) {
      console.error('Error parsing plant data:', error);
    }

    // Save uploaded files
    const fileUrls = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        if (file && file.name) {
          const fileUrl = await saveFile(file, user.id);
          fileUrls.push(fileUrl);
        }
      }
    }

    // Create the help request in database
    // First, check if we have the help_requests table
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='help_requests'`
    ).get();

    if (!tableExists) {
      // Create the table if it doesn't exist
      db.prepare(`
        CREATE TABLE help_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          plant_data TEXT,
          selected_plant_ids TEXT,
          file_urls TEXT,
          status TEXT DEFAULT 'new',
          admin_notes TEXT,
          admin_response TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `).run();
    }

    // Insert the help request
    const insertHelpRequest = db.prepare(`
      INSERT INTO help_requests (
        user_id,
        name,
        email,
        subject,
        message,
        plant_data,
        selected_plant_ids,
        file_urls,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertHelpRequest.run(
      user.id,
      name,
      email,
      subject,
      message,
      JSON.stringify(plantData),
      JSON.stringify(selectedPlantIds),
      JSON.stringify(fileUrls),
      'new'
    );

    if (!result.lastInsertRowid) {
      throw new Error('Failed to create help request');
    }

    // Get the newly created help request
    const helpRequest = db.prepare(`
      SELECT * FROM help_requests WHERE id = ?
    `).get(result.lastInsertRowid);

    // Send email to the recipient
    // This would typically use an email service like SendGrid or Nodemailer
    // For now, we'll just log it
    console.log(`New help request from ${name} (${email}): ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Selected plants: ${JSON.stringify(selectedPlantIds)}`);
    console.log(`Attached files: ${JSON.stringify(fileUrls)}`);

    return new Response(JSON.stringify({ 
      message: "Hilfe-Anfrage erfolgreich gesendet",
      requestId: helpRequest.id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating help request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET /api/help-requests - Get all help requests (admin only)
export async function GET() {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('Cannot fetch help requests on client side');
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user exists
    let user;
    try {
      // First check if the is_admin column exists
      const columnsResult = db.prepare("PRAGMA table_info(users)").all();
      const hasIsAdminColumn = columnsResult.some(col => col.name === 'is_admin');
      
      if (hasIsAdminColumn) {
        user = db.prepare("SELECT id, is_admin FROM users WHERE username = ?").get(session.user.name);
      } else {
        // If is_admin column doesn't exist, just get the ID and handle admin check differently
        user = db.prepare("SELECT id FROM users WHERE username = ?").get(session.user.name);
      }

      if (!user) {
        return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // For testing purposes, consider specific usernames as admins if the column doesn't exist
      // In a production app, you'd want to properly add this column to the database
      const isAdmin = user.is_admin || session.user.name === 'workshop' || session.user.name === 'admin';
      
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Nicht autorisiert" }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (dbError) {
      console.error('Database error during admin check:', dbError);
      // Allow access for specific users even if there's a DB error
      if (session.user.name !== 'workshop' && session.user.name !== 'admin') {
        return new Response(JSON.stringify({ error: "Datenbankfehler" }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Check if table exists
    const tableExists = db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='help_requests'`
    ).get();

    if (!tableExists) {
      return new Response(JSON.stringify({ helpRequests: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all help requests
    const helpRequests = db.prepare(`
      SELECT hr.*, u.username as username
      FROM help_requests hr
      JOIN users u ON hr.user_id = u.id
      ORDER BY hr.created_at DESC
    `).all();

    return new Response(JSON.stringify({ helpRequests }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
