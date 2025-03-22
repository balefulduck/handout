const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

/**
 * Reset users table and add admin role
 * This script will:
 * 1. Add admin column to users table if it doesn't exist
 * 2. Reset all user-related tables (users, plants, setups, etc.)
 * 3. Create two new users: admin and Jan
 */
async function resetUsers() {
  console.log('Starting database reset process...');
  
  // Initialize database connection
  const dbPath = path.join(process.cwd(), 'cannabis-workshop.db');
  console.log(`Opening database at: ${dbPath}`);
  
  // Check if database file exists
  if (!fs.existsSync(dbPath)) {
    console.error(`Database file not found at: ${dbPath}`);
    console.log('Creating new database file...');
  }
  
  const db = new Database(dbPath, { verbose: console.log });
  
  try {
    // Temporarily disable foreign keys for clean deletion
    db.pragma('foreign_keys = OFF');
    
    // Begin transaction
    db.exec('BEGIN TRANSACTION;');
    
    // Get all tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';").all();
    console.log('Found tables:', tables.map(t => t.name).join(', '));
    
    // Clear all user-related tables in the correct order to avoid foreign key issues
    const tablesToClear = [
      // Child tables first
      'fertilizer_usage',
      'plant_days',
      'plant_setup_mappings',
      'setup_day_entries',
      'user_strains',
      'harvests',
      'help_requests',
      'feedback',
      // Then parent tables
      'plants',
      'plant_setups',
      // Finally the users table
      'users'
    ];
    
    // Clear each table if it exists
    for (const tableName of tablesToClear) {
      const tableExists = tables.some(t => t.name === tableName);
      if (tableExists) {
        console.log(`Clearing table: ${tableName}`);
        db.exec(`DELETE FROM ${tableName};`);
        // Reset auto-increment counters
        db.exec(`DELETE FROM sqlite_sequence WHERE name='${tableName}';`);
      }
    }
    
    // Check if users table exists, create it if not
    const usersTableExists = tables.some(t => t.name === 'users');
    if (!usersTableExists) {
      console.log('Users table does not exist. Creating it...');
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    // Insert admin user
    console.log('Creating admin user...');
    db.prepare(`
      INSERT INTO users (username, password_hash, is_admin)
      VALUES (?, ?, 1);
    `).run('admin', adminPasswordHash);
    
    // Insert Jan user
    console.log('Creating Jan user...');
    db.prepare(`
      INSERT INTO users (username, password_hash, is_admin)
      VALUES (?, ?, 0);
    `).run('Jan', janPasswordHash);
    
    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Commit transaction
    db.exec('COMMIT;');
    
    console.log('Database reset complete!');
    console.log('Created users:');
    console.log('1. admin (with admin privileges)');
    console.log('2. Jan (regular user)');
    
  } catch (error) {
    // Rollback transaction on error
    db.exec('ROLLBACK;');
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    // Re-enable foreign keys before closing
    db.pragma('foreign_keys = ON');
    // Close database connection
    db.close();
  }
}

// Run the script
resetUsers().catch(console.error);
