const pool = require('../config/db').promise();
const User = require('../entities/User');

class UserRepository {
    /**
     * Finds a single user by a specific column and value.
     * @param {string} column - The database column name (e.g., 'id', 'email').
     * @param {any} value - The value to search for.
     * @returns {Promise<Object|null>} The user object if found, otherwise null.
     */
    async findOne(column, value) {
        try {
            const [rows] = await pool.query(
                `SELECT * FROM users WHERE ${column} = ? LIMIT 1`,
                [value]
            );

            return rows[0] ? new User(rows[0]) : null;
        } catch (error) {
            console.error(`[UserRepository.findOne] Error finding user by ${column}:`, error.message);
            throw error;
        }
    }

    /**
     * Saves a new user to the database.
     * @param {Object} user - The user entity containing all necessary fields.
     * @returns {Promise<number>} The ID of the newly created user.
     */
    async save(user) {
        try {
            const [result] = await pool.query(
                `INSERT INTO users (username, email, password, coins, wins, lost, winrate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.username, user.email, user.password, user.coins, user.wins, user.lost, user.winrate]
            );
            return result.insertId;
        } catch (error) {
            console.error('[UserRepository.save] Error saving user:', error.message);
            throw error;
        }
    }

    async create({ username, email, password }) {
        const [result] = await pool.query(
            `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
            [username, email, password]
        );
        return result.insertId;
    }

    /**
     * Retrieves all users sorted by wins, winrate, and level.
     * @returns {Promise<Array>} An array of user objects.
     */
    async getLeaderboard(number) {
        try {
            const [rows] = await pool.query(
                `SELECT id, username, wins, lost, winrate FROM users ORDER BY wins DESC LIMIT ?`,
                [number]
            );
            return rows;
        } catch (error) {
            console.error('[UserRepository.getLeaderboard] Error fetching users:', error.message);
            throw error;
        }
    }

    /**
     * Updates specific fields of a user by their ID.
     * @param {number} userId - The unique ID of the user to update.
     * @param {Object} updates - An object containing key-value pairs of fields to update.
     * @returns {Promise<Object|void>} The database result object.
     */
    async update(userId, updates) {
        const keys = Object.keys(updates);
        if (keys.length === 0) return;

        try {
            const query = `UPDATE users SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE id = ?`;
            const values = [...Object.values(updates), userId];
            
            const [result] = await pool.query(query, values);
            
            if (result.affectedRows === 0) {
                console.warn(`[UserRepository.update] No user found with ID: ${userId}`);
            }
            return result;
        } catch (error) {
            console.error(`[UserRepository.update] Error updating user ${userId}:`, error.message);
            throw error;
        }
    }
}

module.exports = new UserRepository();