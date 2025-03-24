const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

/**
 * Database restore script
 * This script restores the SQLite database after deployment
 * If no backup exists, it ensures the default users exist
 */
async function restoreDatabase() {
  console.log('Starting database restore process...');
  
  // Define paths
  const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
  const backupDir = path.join(process.cwd(), 'backup');
  const backupPath = path.join(backupDir, 'cannabis-workshop.backup.db');
  
  // Check if backup exists
  if (fs.existsSync(backupPath)) {
    console.log('Found database backup, restoring...');
    
    try {
      // If database already exists, create a temporary backup before overwriting
      if (fs.existsSync(dbPath)) {
        const tempBackupPath = path.join(process.cwd(), 'cannabis-workshop.temp.db');
        fs.copyFileSync(dbPath, tempBackupPath);
        console.log('Created temporary backup of current database');
      }
      
      // Copy backup to database location
      fs.copyFileSync(backupPath, dbPath);
      
      // Get file sizes to verify restore
      const backupSize = fs.statSync(backupPath).size;
      const restoredSize = fs.statSync(dbPath).size;
      
      console.log(`Backup database size: ${backupSize} bytes`);
      console.log(`Restored database size: ${restoredSize} bytes`);
      
      if (backupSize === restoredSize) {
        console.log('Database restore completed successfully!');
      } else {
        console.warn('Warning: Restored file size differs from backup!');
      }
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  } else {
    console.log('No backup found. Ensuring default users exist...');
    await ensureDefaultUsers();
  }
}

/**
 * Ensures that default users (admin and Jan) exist in the database
 * Only creates them if they don't already exist
 */
async function ensureDefaultUsers() {
  console.log('Checking for default users...');
  
  // Initialize database connection
  const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
  console.log(`Opening database at: ${dbPath}`);
  
  const db = new Database(dbPath);
  
  try {
    // Check if users table exists
    const usersTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users';").all().length > 0;
    
    if (!usersTableExists) {
      console.log('Users table does not exist. Creating it...');
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_admin INTEGER DEFAULT 0
        );
      `);
    }
    
    // Check if admin column exists in users table
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columns = tableInfo.map(col => col.name);
    
    if (!columns.includes('is_admin')) {
      console.log('Adding is_admin column to users table...');
      db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;');
    }
    
    // Create password hashes
    const adminPasswordHash = await bcrypt.hash('66292', 10);
    const janPasswordHash = await bcrypt.hash('drc', 10);
    
    // Check if admin user exists
    const adminExists = db.prepare("SELECT id FROM users WHERE username = 'admin'").all().length > 0;
    if (!adminExists) {
      console.log('Creating admin user...');
      db.prepare(`
        INSERT INTO users (username, password_hash, is_admin)
        VALUES (?, ?, 1);
      `).run('admin', adminPasswordHash);
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if Jan user exists
    const janExists = db.prepare("SELECT id FROM users WHERE username = 'Jan'").all().length > 0;
    if (!janExists) {
      console.log('Creating Jan user...');
      db.prepare(`
        INSERT INTO users (username, password_hash, is_admin)
        VALUES (?, ?, 0);
      `).run('Jan', janPasswordHash);
    } else {
      console.log('Jan user already exists');
    }
    
    // List all users
    const users = db.prepare("SELECT id, username, is_admin FROM users").all();
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.username}, Admin: ${user.is_admin ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('Error ensuring default users:', error);
    throw error;
  } finally {
    // Close database connection
    db.close();
  }
}

// Run the restore function
restoreDatabase().catch(console.error);
