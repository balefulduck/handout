// Seed script for phase_content table
const { db } = require('../../lib/db');

function seedPhaseContent() {
  console.log('Seeding phase_content table...');
  
  // First check if table exists and is empty
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='phase_content'").get();
  
  if (!tableExists) {
    console.log('Phase content table does not exist. Please run the migration first.');
    return;
  }
  
  const count = db.prepare('SELECT COUNT(*) as count FROM phase_content').get();
  
  if (count && count.count > 0) {
    console.log('Phase content table already contains data. Skipping seed.');
    return;
  }
  
  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT INTO phase_content (phase, content_type, title, content_values, tooltip, color_theme)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Begin transaction
  const transaction = db.transaction(() => {
    // SEEDLING PHASE CONTENT
    insertStmt.run(
      'seedling',
      'temperature',
      'Temperatur',
      JSON.stringify(['20 - 25°C Tagsüber', '18 - 22°C Nachts']),
      'Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden.',
      'purple'
    );
    
    insertStmt.run(
      'seedling',
      'humidity',
      'Luftfeuchtigkeit',
      JSON.stringify(['80 - 90% RH']),
      'Jungpflanzen gleichen die schwache Wurzelstruktur aus, indem sie vermehrt Feuchtigkeit über das Blattwerk aufnehmen',
      'purple'
    );
    
    insertStmt.run(
      'seedling',
      'light',
      'Lichtzyklus',
      JSON.stringify(['18 / 6']),
      'Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen.',
      'purple'
    );
    
    insertStmt.run(
      'seedling',
      'ph',
      'pH Wert',
      JSON.stringify(['5.8 - 6.8']),
      'Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen.',
      'purple'
    );
    
    insertStmt.run(
      'seedling',
      'pots',
      'Topfgrößen',
      JSON.stringify([
        'Photoperiodische Sorten sollten in 0,25 - 1 L Töpfe gepflanzt und nach vollständiger Durchwurzelung in ein Endgefäß mit einem Fassungsvermögen zwischen 9 und 25 Litern transplantiert werden.',
        'Automatische Sorten sollten direkt in den Endtopf gepflant werden.'
      ]),
      null,
      'purple'
    );
    
    // VEGETATION PHASE CONTENT
    insertStmt.run(
      'vegetation',
      'temperature',
      'Temperatur',
      JSON.stringify(['20 - 26°C Tagsüber', '18 - 22°C Nachts']),
      'Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden.',
      'medium-blue'
    );
    
    insertStmt.run(
      'vegetation',
      'humidity',
      'Luftfeuchtigkeit',
      JSON.stringify(['60 - 70% RH']),
      'Eine hohe Luftfeuchtigkeit fördert das Wachstum der Pflanze und reduziert den Wasserbedarf.',
      'medium-blue'
    );
    
    insertStmt.run(
      'vegetation',
      'light',
      'Lichtzyklus',
      JSON.stringify(['18 / 6']),
      'Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen.',
      'medium-blue'
    );
    
    insertStmt.run(
      'vegetation',
      'ph',
      'pH Wert',
      JSON.stringify(['5.8 - 6.5']),
      'Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen.',
      'medium-blue'
    );
    
    // FLOWER PHASE CONTENT
    insertStmt.run(
      'flower',
      'temperature',
      'Temperatur',
      JSON.stringify(['20 - 26°C Tagsüber', '18 - 20°C Nachts']),
      'Bei zu hohen Temperaturschwankungen kann das Wachstum der Pflanze gehemmt werden.',
      'olive-green'
    );
    
    insertStmt.run(
      'flower',
      'humidity',
      'Luftfeuchtigkeit',
      JSON.stringify(['40 - 50% RH']),
      'Jungpflanzen gleichen die schwache Wurzelstruktur aus, indem sie vermehrt Feuchtigkeit über das Blattwerk aufnehmen',
      'olive-green'
    );
    
    insertStmt.run(
      'flower',
      'light',
      'Lichtzyklus',
      JSON.stringify(['12 / 12']),
      'Bei photoperiodischen Sorten bestimmt der Lichtzyklus die Wachstumsphasen.',
      'olive-green'
    );
    
    insertStmt.run(
      'flower',
      'ph',
      'pH Wert',
      JSON.stringify(['5.8 - 6.2']),
      'Der pH-Wert beeinflusst die Nährstoffaufnahme, Wurzelgesundheit und Pflanzengesundheit. Ein falscher Wert kann Mangelerscheinungen und Wachstumsprobleme verursachen.',
      'olive-green'
    );
    
    insertStmt.run(
      'flower',
      'info',
      'Blütephase',
      JSON.stringify(['Dauer: 8-12 Wochen']),
      null,
      'olive-green'
    );
    
    // HARVEST PHASE CONTENT
    insertStmt.run(
      'harvest',
      'ready',
      'Erntereife',
      JSON.stringify(['Wenn 70-90% der Trichome milchig (wolkig) sind', 'Einige Trichome sollten bereits amber (bernsteinfarben) sein']),
      'Die Farbe der Trichome gibt Aufschluss über die Reife und das Wirkungsprofil der Pflanze.',
      'gradient-purple'
    );
    
    insertStmt.run(
      'harvest',
      'methods',
      'Erntemethoden',
      JSON.stringify(['Ganze Pflanze ernten', 'Partielle Ernte (Untere Äste zuerst)']),
      'Die Erntemethode beeinflusst die Qualität und den Ertrag der Ernte.',
      'gradient-purple'
    );
    
    insertStmt.run(
      'harvest',
      'drying',
      'Trocknung',
      JSON.stringify(['7-14 Tage bei 15-21°C', '45-55% Luftfeuchtigkeit', 'Luftzirkulation ohne direkte Anblasung']),
      'Langsames Trocknen erhält Terpene und erzeugt ein besseres Endprodukt.',
      'gradient-purple'
    );
    
    insertStmt.run(
      'harvest',
      'curing',
      'Fermentierung',
      JSON.stringify(['2-8 Wochen in luftdichten Gläsern', 'Mehrmals täglich für 15 Minuten lüften (Burping)']),
      'Die Fermentierung verbessert Geschmack, Aroma und Wirkung.',
      'gradient-purple'
    );
  });
  
  // Execute transaction
  transaction();
  
  console.log('Phase content data seeded successfully');
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedPhaseContent();
}

module.exports = { seedPhaseContent };
