const pool = require('../config/db').promise();
const Battle = require('../entities/Battle');

class BattleRepository {
    /**
     * Saves a new battle record to the database.
     * @param {Battle} battle - The Battle entity instance.
     * @returns {Promise<number>} The ID of the inserted record.
     */
    async save(battle) {
        try {
            const [result] = await pool.query(
                `INSERT INTO battles 
                (battle_time, units_deployed, turns, user1_id, user2_id, winner_id) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    battle.battleTime,
                    battle.unitsDeployed,
                    battle.turns,
                    battle.user1Id,
                    battle.user2Id,
                    battle.winnerId
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('[BattleRepository.save] Error saving battle:', error.message);
            throw error;
        }
    }

    /**
     * Retrieves recent matches with opponent usernames and win/loss results.
     * @param {number} userId - The ID of the user.
     * @param {number} limit - Max records to return.
     */
    async getRecentMatches(userId, limit = 10) {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    b.*, 
                    u1.username AS user1Username, 
                    u2.username AS user2Username,
                    CASE WHEN b.winner_id = ? THEN 'win' ELSE 'loss' END as result
                FROM battles b
                JOIN users u1 ON b.user1_id = u1.id
                JOIN users u2 ON b.user2_id = u2.id
                WHERE b.user1_id = ? OR b.user2_id = ? 
                ORDER BY b.battle_time DESC 
                LIMIT ?`,
                [userId, userId, userId, limit]
            );
            return rows;
        } catch (error) {
            console.error('[BattleRepository.getRecentMatches] Error:', error.message);
            throw error;
        }
    }

    /**
     * Gets a single battle record by its ID.
     * @param {number} battleId
     * @returns {Promise<Battle|null>}
     */
    async findById(battleId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM battles WHERE id = ? LIMIT 1',
                [battleId]
            );
            return rows[0] ? new Battle(rows[0]) : null;
        } catch (error) {
            console.error(`[BattleRepository.findById] Error:`, error.message);
            throw error;
        }
    }

    /**
     * Calculates total units deployed by all users (global stats).
     * @returns {Promise<number>}
     */
    async getTotalUnitsDeployed() {
        try {
            const [rows] = await pool.query('SELECT SUM(units_deployed) as total FROM battles');
            return rows[0].total || 0;
        } catch (error) {
            console.error('[BattleRepository.getTotalUnitsDeployed] Error:', error.message);
            throw error;
        }
    }
}

module.exports = new BattleRepository();