const { db } = require('./index');
const strainData = require('../../data/strains.json');

// Pre-configured user with password 'drc'
const mockUser = {
    username: 'workshop',
    password_hash: '$2b$12$/HnsHinDsAFpDaFwwUqo7ugaxmsNABkPddf51s2M4NtUJwT30QPWq'
};

const seedDatabase = () => {
    console.log('Starting database seeding...');
    
    // Seed strains from strains.json
    const insertStrain = db.prepare(`
        INSERT OR REPLACE INTO strains (id, name, type, thc, cbd, flowering_time, description, effects)
        VALUES (@id, @name, @type, @thc, @cbd, @flowering_time, @description, @effects)
    `);

    const insertStrains = db.transaction((strains) => {
        for (const strain of strains) {
            insertStrain.run({
                ...strain,
                effects: JSON.stringify(strain.effects)
            });
        }
    });

    // Seed mock user
    const insertUser = db.prepare(`
        INSERT OR REPLACE INTO users (username, password_hash)
        VALUES (@username, @password_hash)
    `);

    try {
        // Always add mock user
        insertUser.run(mockUser);
        console.log('Mock user added successfully!');

        // Check if database is empty before seeding strains
        const strainsEmpty = db.prepare('SELECT COUNT(*) as count FROM strains').get();
        if (strainsEmpty.count === 0) {
            insertStrains(strainData.strains);
            console.log('Strains seeded successfully!');
        }
    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
};

module.exports = { seedDatabase };
