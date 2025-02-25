const Database = require('better-sqlite3');
const path = require('path');

let db;

// Initialize database connection
const getDb = () => {
    if (!db) {
        console.log('Initializing database connection...');
        console.log('Database path:', path.join(process.cwd(), 'cannabis-workshop.db'));
        
        db = new Database(path.join(process.cwd(), 'cannabis-workshop.db'), {
            verbose: console.log
        });

        // Enable foreign keys
        db.pragma('foreign_keys = ON');
    }
    return db;
};

// Initialize database schema
const initDb = () => {
    const db = getDb();
    console.log('Creating database schema...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            onboarding_completed INTEGER DEFAULT 0
        );
    `);

    // Strains catalog - updated to match JSON structure
    db.exec(`
        CREATE TABLE IF NOT EXISTS strains (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            thc TEXT NOT NULL,
            cbd TEXT NOT NULL,
            flowering_time INTEGER,
            description TEXT,
            effects TEXT
        );
    `);

    // User selected strains
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_strains (
            user_id INTEGER,
            strain_id INTEGER,
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(strain_id) REFERENCES strains(id) ON DELETE CASCADE,
            PRIMARY KEY(user_id, strain_id)
        );
    `);

    // Plants table
    db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            strain_id INTEGER,
            name TEXT,
            status TEXT DEFAULT 'active',
            start_date DATE,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(strain_id) REFERENCES strains(id) ON DELETE CASCADE
        );
    `);

    console.log('Schema creation complete');
};

module.exports = { db: getDb(), initDb };
