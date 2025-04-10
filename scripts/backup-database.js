const fs = require('fs');
const path = require('path');

/**
 * Database backup script
 * This script creates a backup of the SQLite database before deployment
 */
function backupDatabase() {
  console.log('Starting database backup process...');
  
  // Define paths
  const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
  const backupDir = path.join(process.cwd(), 'backup');
  const backupPath = path.join(backupDir, 'cannabis-workshop.backup.db');
  
  // Check if database exists
  if (!fs.existsSync(dbPath)) {
    console.log('No database found to backup at:', dbPath);
    return;
  }
  
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    console.log('Creating backup directory...');
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  try {
    // Copy database file to backup location
    console.log(`Copying database from ${dbPath} to ${backupPath}`);
    fs.copyFileSync(dbPath, backupPath);
    
    // Get file sizes to verify backup
    const originalSize = fs.statSync(dbPath).size;
    const backupSize = fs.statSync(backupPath).size;
    
    console.log(`Original database size: ${originalSize} bytes`);
    console.log(`Backup database size: ${backupSize} bytes`);
    
    if (originalSize === backupSize) {
      console.log('Database backup completed successfully!');
    } else {
      console.warn('Warning: Backup file size differs from original database!');
    }
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
}

// Run the backup function
backupDatabase();
