const Database = require('better-sqlite3');
const path = require('path');

async function addMockPlant() {
  try {
    // Open database connection with the correct database name
    const db = new Database(path.join(process.cwd(), 'cannabis-workshop.db'));
    
    // Get user ID for Jan
    const user = db.prepare("SELECT id FROM users WHERE username = ?").get("Jan");
    
    if (!user) {
      console.error("User 'Jan' not found in the database");
      return;
    }
    
    // Calculate dates
    const today = new Date();
    
    // Plant created 94 days ago
    const createdDate = new Date(today);
    createdDate.setDate(today.getDate() - 94);
    const createdDateStr = createdDate.toISOString().split('T')[0];
    
    // Flowering started on day 31 (63 days ago)
    const floweringDate = new Date(today);
    floweringDate.setDate(today.getDate() - 63);
    const floweringDateStr = floweringDate.toISOString().split('T')[0];
    
    // Harvest date (today)
    const harvestDateStr = today.toISOString().split('T')[0];
    
    // Begin transaction
    db.prepare('BEGIN TRANSACTION').run();
    
    try {
      // Insert the plant with the correct column names based on the actual schema
      const plantStmt = db.prepare(`
        INSERT INTO plants (
          user_id, name, status, start_date, 
          flowering_start_date, breeder, genetic_type,
          expected_flowering_days, substrate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const plantInfo = plantStmt.run(
        user.id,
        "Harvest Demo",
        "harvested",
        createdDateStr,
        floweringDateStr,
        "Royal Queen Seeds",
        "Indica dominant",
        63,
        "soil"
      );
      
      const plantId = plantInfo.lastInsertRowid;
      console.log(`Created plant with ID: ${plantId}`);
      
      // Check if harvests table exists
      const harvestsTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='harvests'").get();
      
      if (harvestsTableExists) {
        // Add harvest data
        const harvestStmt = db.prepare(`
          INSERT INTO harvests (
            plant_id, consumption_material, consumption_method, 
            description, bud_density, trichome_color, 
            curing_begin, curing_end, dry_weight
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const harvestInfo = harvestStmt.run(
          plantId,
          "flower",
          "smoking",
          "Great harvest with dense buds and strong aroma. Trichomes were mostly milky with some amber.",
          4,
          "milky",
          harvestDateStr,
          "", // Curing end date not set yet
          "62.5" // Dry weight in grams
        );
        
        console.log(`Added harvest data with ID: ${harvestInfo.lastInsertRowid}`);
      } else {
        console.log("Harvests table doesn't exist in the database, skipping harvest data");
      }
      
      // Check if plant_days table exists
      const plantDaysTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='plant_days'").get();
      
      if (plantDaysTableExists) {
        // Add some day entries to simulate growth
        const dayEntryStmt = db.prepare(`
          INSERT INTO plant_days (
            plant_id, date, day_number, watering_amount, notes, watered
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        // Day 1 - Planting
        dayEntryStmt.run(
          plantId,
          createdDateStr,
          1,
          200,
          "Plant started from seed in soil.",
          1
        );
        
        // Day 15 - Vegetative growth
        const day15Date = new Date(createdDate);
        day15Date.setDate(createdDate.getDate() + 15);
        dayEntryStmt.run(
          plantId,
          day15Date.toISOString().split('T')[0],
          15,
          500,
          "Plant showing healthy vegetative growth.",
          1
        );
        
        // Day 31 - Switch to flowering
        const day31Date = new Date(createdDate);
        day31Date.setDate(createdDate.getDate() + 31);
        dayEntryStmt.run(
          plantId,
          day31Date.toISOString().split('T')[0],
          31,
          700,
          "Switched to flowering phase. Changed light schedule to 12/12.",
          1
        );
        
        // Day 60 - Mid flowering
        const day60Date = new Date(createdDate);
        day60Date.setDate(createdDate.getDate() + 60);
        dayEntryStmt.run(
          plantId,
          day60Date.toISOString().split('T')[0],
          60,
          800,
          "Buds developing nicely. Trichomes starting to form.",
          1
        );
        
        // Day 94 - Harvest day
        dayEntryStmt.run(
          plantId,
          harvestDateStr,
          94,
          0,
          "Harvest day! Plant looks ready with mostly milky trichomes and some amber. Estimated yield looks good.",
          0
        );
        
        console.log("Added day entries for the plant");
      } else {
        console.log("Plant_days table doesn't exist in the database, skipping day entries");
      }
      
      // Commit transaction
      db.prepare('COMMIT').run();
      
      console.log("Successfully added mock plant with harvest data and day entries!");
    } catch (error) {
      // Rollback transaction on error
      db.prepare('ROLLBACK').run();
      throw error;
    } finally {
      // Close the database connection
      db.close();
    }
    
  } catch (error) {
    console.error("Error adding mock plant:", error);
  }
}

// Run the function
addMockPlant();
