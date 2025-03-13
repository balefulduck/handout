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
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // Plants table - extended with additional fields for plant growth tracking
    db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            strain_id INTEGER,
            name TEXT NOT NULL,
            breeder TEXT,
            genetic_type TEXT,
            expected_flowering_days INTEGER,
            start_date DATE NOT NULL,
            flowering_start_date DATE,
            status TEXT DEFAULT 'active',
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(strain_id) REFERENCES strains(id) ON DELETE CASCADE
        );
    `);
    
    // Check if the plants table has the new columns and add them if they don't exist
    const tableInfo = db.prepare("PRAGMA table_info(plants)").all();
    const columns = tableInfo.map(col => col.name);
    
    // Add missing columns to the plants table if they don't exist
    if (!columns.includes('breeder')) {
        console.log('Adding breeder column to plants table...');
        db.exec('ALTER TABLE plants ADD COLUMN breeder TEXT;');
    }
    
    if (!columns.includes('genetic_type')) {
        console.log('Adding genetic_type column to plants table...');
        db.exec('ALTER TABLE plants ADD COLUMN genetic_type TEXT;');
    }
    
    if (!columns.includes('expected_flowering_days')) {
        console.log('Adding expected_flowering_days column to plants table...');
        db.exec('ALTER TABLE plants ADD COLUMN expected_flowering_days INTEGER;');
    }
    
    if (!columns.includes('flowering_start_date')) {
        console.log('Adding flowering_start_date column to plants table...');
        db.exec('ALTER TABLE plants ADD COLUMN flowering_start_date DATE;');
    }

    // Plant days table - for tracking daily plant data
    db.exec(`
        CREATE TABLE IF NOT EXISTS plant_days (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER NOT NULL,
            date DATE NOT NULL,
            day_number INTEGER NOT NULL,
            watered INTEGER DEFAULT 0,
            topped INTEGER DEFAULT 0,
            ph_value REAL,
            watering_amount INTEGER,
            temperature REAL,
            humidity INTEGER,
            notes TEXT,
            FOREIGN KEY(plant_id) REFERENCES plants(id) ON DELETE CASCADE,
            UNIQUE(plant_id, date)
        );
    `);
    
    // Check if the plant_days table has the new columns and add them if they don't exist
    const plantDaysTableInfo = db.prepare("PRAGMA table_info(plant_days)").all();
    const plantDaysColumns = plantDaysTableInfo.map(col => col.name);
    
    // Add missing columns to the plant_days table if they don't exist
    if (!plantDaysColumns.includes('watering_amount')) {
        console.log('Adding watering_amount column to plant_days table...');
        db.exec('ALTER TABLE plant_days ADD COLUMN watering_amount INTEGER;');
    }
    
    if (!plantDaysColumns.includes('temperature')) {
        console.log('Adding temperature column to plant_days table...');
        db.exec('ALTER TABLE plant_days ADD COLUMN temperature REAL;');
    }
    
    if (!plantDaysColumns.includes('humidity')) {
        console.log('Adding humidity column to plant_days table...');
        db.exec('ALTER TABLE plant_days ADD COLUMN humidity INTEGER;');
    }
    
    if (!plantDaysColumns.includes('setup_entry_id')) {
        console.log('Adding setup_entry_id column to plant_days table...');
        db.exec('ALTER TABLE plant_days ADD COLUMN setup_entry_id INTEGER;');
    }

    // Fertilizer usage table - for tracking fertilizers used on specific days
    db.exec(`
        CREATE TABLE IF NOT EXISTS fertilizer_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_day_id INTEGER NOT NULL,
            fertilizer_name TEXT NOT NULL,
            amount TEXT,
            FOREIGN KEY(plant_day_id) REFERENCES plant_days(id) ON DELETE CASCADE
        );
    `);

    // Harvests table - for tracking plant harvest data
    db.exec(`
        CREATE TABLE IF NOT EXISTS harvests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_id INTEGER NOT NULL,
            consumption_material TEXT CHECK(consumption_material IN ('flower', 'concentrate', 'edible')),
            consumption_method TEXT CHECK(consumption_method IN ('smoking', 'vaping')),
            description TEXT,
            bud_density INTEGER CHECK(bud_density BETWEEN 1 AND 5),
            trichome_color TEXT,
            curing_begin DATE,
            curing_end DATE,
            dry_weight REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(plant_id) REFERENCES plants(id) ON DELETE CASCADE,
            UNIQUE(plant_id)
        );
    `);

    // Plant Setups table - for grouping plants for batch operations
    db.exec(`
        CREATE TABLE IF NOT EXISTS plant_setups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    // Plant-Setup relationships (many-to-many)
    db.exec(`
        CREATE TABLE IF NOT EXISTS plant_setup_mappings (
            setup_id INTEGER NOT NULL,
            plant_id INTEGER NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(setup_id, plant_id),
            FOREIGN KEY(setup_id) REFERENCES plant_setups(id) ON DELETE CASCADE,
            FOREIGN KEY(plant_id) REFERENCES plants(id) ON DELETE CASCADE
        );
    `);
    
    // Setup day entries table - for tracking batch day entries for setups
    db.exec(`
        CREATE TABLE IF NOT EXISTS setup_day_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            setup_id INTEGER NOT NULL,
            date DATE NOT NULL,
            watered INTEGER DEFAULT 0,
            topped INTEGER DEFAULT 0,
            ph_value REAL,
            watering_amount INTEGER,
            temperature REAL,
            humidity INTEGER,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(setup_id) REFERENCES plant_setups(id) ON DELETE CASCADE,
            UNIQUE(setup_id, date)
        );
    `);

    // Update fertilizer_usage table schema if needed
    const fertilizerTableInfo = db.prepare("PRAGMA table_info(fertilizer_usage)").all();
    const fertilizerColumns = fertilizerTableInfo.map(col => col.name);
    
    if (!fertilizerColumns.includes('setup_day_id')) {
        console.log('Adding setup_day_id column to fertilizer_usage table...');
        db.exec('ALTER TABLE fertilizer_usage ADD COLUMN setup_day_id INTEGER REFERENCES setup_day_entries(id) ON DELETE CASCADE;');
    }

    console.log('Schema creation complete');
    console.log('Database schema updated successfully');
};

module.exports = { db: getDb(), initDb };
