import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Database backup/restore API endpoint
// Only accessible to admin users

export async function GET(request) {
  // Verify admin access
  const session = await getServerSession(authOptions);
  
  // Debug session information
  console.log('API: Session data:', JSON.stringify(session, null, 2));
  
  // Check if session exists
  if (!session) {
    console.log('API: No session found');
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Check if user is admin
  if (!session.user?.isAdmin) {
    console.log('API: User is not admin', session.user);
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
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
