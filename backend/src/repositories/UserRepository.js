const pool = require('../config/db');
const User = require('../entities/User');

class UserRepository {
    async save(user) {
        pool.promise().query(
            'INSERT INTO users (full_name, login, email, password, coins, wins, lost, winrate, lvl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user.fullName, user.login, user.email, user.password, user.coins, user.wins, user.lost, user.winrate, user.lvl]
        );
    }

    async getAllOrderedByWins() {
        const [rows] = await pool.promise().query('SELECT * FROM users ORDER BY wins DESC, winrate DESC, lvl DESC');
        return rows;
    }
}