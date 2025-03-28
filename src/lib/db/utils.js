const db = require('./index');

const dbUtils = {
    // User related operations
    createUser: (username, passwordHash, email = null) => {
        const stmt = db.prepare('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)');
        return stmt.run(username, passwordHash, email);
    },

    getUserById: (id) => {
        const stmt = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?');
        return stmt.get(id);
    },

    getUserByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    },

    updateUserEmail: (userId, email) => {
        const stmt = db.prepare('UPDATE users SET email = ? WHERE id = ?');
        return stmt.run(email, userId);
    },

    // Onboarding status function removed

    // Strain related operations
    getAllStrains: () => {
        const stmt = db.prepare('SELECT * FROM strains');
        return stmt.all();
    },

    getUserStrains: (userId) => {
        const stmt = db.prepare(`
            SELECT s.* 
            FROM strains s
            JOIN user_strains us ON s.id = us.strain_id
            WHERE us.user_id = ?
        `);
        return stmt.all(userId);
    },

    selectUserStrains: (userId, strainIds) => {
        const insert = db.prepare('INSERT INTO user_strains (user_id, strain_id) VALUES (?, ?)');
        
        const insertMany = db.transaction((userId, strainIds) => {
            for (const strainId of strainIds) {
                insert.run(userId, strainId);
            }
        });

        return insertMany(userId, strainIds);
    },

    // Progress tracking
    updateUserProgress: (userId, strainId, phase, notes = null) => {
        const stmt = db.prepare(`
            INSERT INTO user_progress (user_id, strain_id, phase, notes)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(userId, strainId, phase, notes);
    },

    getUserProgress: (userId) => {
        const stmt = db.prepare(`
            SELECT up.*, s.name as strain_name
            FROM user_progress up
            JOIN strains s ON up.strain_id = s.id
            WHERE up.user_id = ?
            ORDER BY up.start_date DESC
        `);
        return stmt.all(userId);
    }
};

module.exports = dbUtils;
