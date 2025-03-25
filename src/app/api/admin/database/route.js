import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import { resetDb } from '@/lib/db';

// Database backup/restore API endpoint
// Only accessible to admin users

// Helper function to verify admin access
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);
  
  // Debug session information
  console.log('API: Session data:', JSON.stringify(session, null, 2));
  
  // Check if session exists
  if (!session) {
    console.log('API: No session found');
    return { authorized: false, status: 401, error: 'Not authenticated' };
  }
  
  // Check if user is admin
  if (!session.user?.isAdmin) {
    console.log('API: User is not admin', session.user);
    return { authorized: false, status: 403, error: 'Unauthorized - Admin access required' };
  }
  
  return { authorized: true };
}

export async function GET(request) {
  // Verify admin access
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'backup') {
    return handleBackup();
  } else if (action === 'restore') {
    return handleRestore();
  } else if (action === 'download') {
    return handleDownload();
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

async function handleBackup() {
  try {
    // Define paths
    const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
    const backupDir = path.join(process.cwd(), 'backup');
    const backupPath = path.join(backupDir, 'cannabis-workshop.backup.db');
    
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'No database found to backup' }, { status: 404 });
    }
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy database file to backup location
    fs.copyFileSync(dbPath, backupPath);
    
    // Get file sizes to verify backup
    const originalSize = fs.statSync(dbPath).size;
    const backupSize = fs.statSync(backupPath).size;
    
    if (originalSize === backupSize) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database backup completed successfully',
        originalSize,
        backupSize,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        warning: 'Backup file size differs from original database',
        originalSize,
        backupSize,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error backing up database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleRestore() {
  try {
    // Define paths
    const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
    const backupDir = path.join(process.cwd(), 'backup');
    const backupPath = path.join(backupDir, 'cannabis-workshop.backup.db');
    
    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'No backup found to restore' }, { status: 404 });
    }
    
    // If database already exists, create a temporary backup before overwriting
    if (fs.existsSync(dbPath)) {
      const tempBackupPath = path.join(process.cwd(), 'cannabis-workshop.temp.db');
      fs.copyFileSync(dbPath, tempBackupPath);
    }
    
    // Copy backup to database location
    fs.copyFileSync(backupPath, dbPath);
    
    // Reset the database connection to ensure the restored database is used
    resetDb();
    console.log('Database connection has been reset to use the restored database');
    
    // Get file sizes to verify restore
    const backupSize = fs.statSync(backupPath).size;
    const restoredSize = fs.statSync(dbPath).size;
    
    if (backupSize === restoredSize) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database restore completed successfully',
        backupSize,
        restoredSize,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        warning: 'Restored file size differs from backup',
        backupSize,
        restoredSize,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error restoring database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle file upload
export async function POST(request) {
  // Verify admin access
  const auth = await verifyAdminAccess();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  
  try {
    // Get the action from the URL
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'upload') {
      // Process the uploaded file
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }
      
      // Verify it's a database file
      if (!file.name.endsWith('.db')) {
        return NextResponse.json({ 
          error: 'Invalid file type. Only .db files are allowed.' 
        }, { status: 400 });
      }
      
      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), 'backup');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Create a backup of the current database if it exists
      const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
      const tempBackupPath = path.join(backupDir, `cannabis-workshop.backup.${Date.now()}.db`);
      
      if (fs.existsSync(dbPath)) {
        console.log('Creating backup of current database before upload...');
        fs.copyFileSync(dbPath, tempBackupPath);
      }
      
      // Convert the file to a Buffer and write it to the database location
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Write the uploaded file to the database location
      await writeFile(dbPath, buffer);
      
      // Reset the database connection to ensure the new database is used
      resetDb();
      
      console.log('Database file uploaded and installed successfully');
      console.log('Database connection has been reset to use the new database');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database uploaded and installed successfully',
        originalName: file.name,
        size: buffer.length,
        backupPath: tempBackupPath
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error uploading database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleDownload() {
  try {
    // Define paths
    const backupDir = path.join(process.cwd(), 'backup');
    const backupPath = path.join(backupDir, 'cannabis-workshop.backup.db');
    
    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'No backup found to download' }, { status: 404 });
    }
    
    // Read the backup file
    const fileBuffer = fs.readFileSync(backupPath);
    
    // Create response with file
    const response = new NextResponse(fileBuffer);
    
    // Set headers for file download
    response.headers.set('Content-Disposition', 'attachment; filename=cannabis-workshop.backup.db');
    response.headers.set('Content-Type', 'application/octet-stream');
    
    return response;
  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
