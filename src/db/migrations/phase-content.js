// Migration to create the phase_content table
const { db } = require('../../lib/db');

function migrate() {
  console.log('Creating phase_content table...');
  
  // Create phase_content table
  db.exec(`
    CREATE TABLE IF NOT EXISTS phase_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase TEXT NOT NULL CHECK(phase IN ('seedling', 'vegetation', 'flower', 'harvest')),
      content_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content_values TEXT NOT NULL, -- JSON string for multiple values
      tooltip TEXT,
      color_theme TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Phase content table created successfully');
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
