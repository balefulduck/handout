const { initDb } = require('./index');
const { seedDatabase } = require('./seed');

console.log('Running database initialization...');

// First initialize the schema
initDb();

// Then seed the database
seedDatabase();

console.log('Database initialization complete.');
