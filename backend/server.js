const fs = require('fs');
const express = require('express');
const path = require('path');
const pool = require('./src/config/db');
const jwt = require('jsonwebtoken');

const UserService = require('./src/services/UserService');
const BattleService = require('./src/services/BattleService');

const app = express();

async function runSchema() {
    const sql = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf8');
    try {
        const connection = await pool.promise().getConnection();
        await connection.query(sql);
        console.log("Database initialised successfully.");
        connection.release();
    } catch (err) {
        console.error("Error while initialising database:", err);
        process.exit(1); 
    }
}

async function startServer() {
    await runSchema();

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../frontend/public')));

    app.post('/api/auth/register', async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const user = await UserService.createUser({ username, email, password });
            
            const token = jwt.sign(
                { userId: user.id, username: user.username }, 
                'SUPER_SECRET_KEY', 
                { expiresIn: '24h' }
            );

            res.status(201).json({ 
                token: token, 
                username: user.username 
            });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await UserService.authenticate(username, password);
            
            if (result) {
                res.json({ 
                    token: result.token, 
                    username: result.username 
                });
            } else {
                res.status(401).json({ message: 'Wrong username or password' });
            }
        } catch (err) {
            console.error('Error in /api/auth/login:', err);
            res.status(500).json({ message: `Server error: ${err.message}` });
        }
    });

    app.get('/api/users/me', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ message: 'No token provided' });

            const token = authHeader.split(' ')[1]; 
            const decoded = jwt.verify(token, 'SUPER_SECRET_KEY');
            const user = await UserService.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                userId: user.id,
                username: user.username,
                avatar: user.avatar || 'assets/images/default-avatar.png',
                wins: user.wins || 0,
                losses: user.lost || 0, 
                level: Math.floor((user.wins || 0) / 5) + 1
            });

        } catch (err) {
            console.error('Error in /api/users/me:', err);
            res.status(401).json({ message: 'Invalid or expired token' });
        }
    });

    app.get('/api/leaderboard', async (req, res) => {
        try {
            const players = await UserService.getLeaderboard(20);
            
            const leaderboard = players.map((p, index) => {
                const wins = p.wins || 0;
                const losses = p.lost || 0; 
                
                return {
                    rank: index + 1,
                    userId: p.id,
                    username: p.username,
                    wins: wins,
                    losses: losses,
                    winRate: wins + losses > 0 
                        ? Math.round((wins / (wins + losses)) * 100) 
                        : 0
                };
            });

            res.json(leaderboard);
        }
        catch (err) {
            console.error('Error in /api/leaderboard:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    app.get('/api/matches/recent', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ message: 'No token provided' });

            const token = authHeader.split(' ')[1]; 
            const decoded = jwt.verify(token, 'SUPER_SECRET_KEY');
            const recentMatches = await BattleService.getRecentMatches(decoded.userId, 10);
            res.json(recentMatches);
        }
        catch (err) {
            console.error('Error in /api/matches/recent:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

startServer();