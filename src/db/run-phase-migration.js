// Script to run phase content migration and seed
const { initDb } = require('../lib/db');
const { migrate } = require('./migrations/phase-content');
const { seedPhaseContent } = require('./seeds/phase-content-seed');

// Ensure the database is initialized
initDb();

// Run the migration
console.log('Running phase content migration...');
migrate();

// Run the seed
console.log('Running phase content seed...');
seedPhaseContent();

console.log('Phase content migration and seed completed!');
