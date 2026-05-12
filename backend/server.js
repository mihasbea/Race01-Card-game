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
        await pool.promise().query(sql);
        console.log("Database initialised successfully.");
    } catch (err) {
        console.error("Error while initialising database:", err);
    }
}

runSchema();
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
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});


// TODO: Move token verification to service(when is possible)
app.get('/api/users/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: 'No token provided' });

        const token = authHeader.split(' ')[1]; 

        const decoded = jwt.verify(token, 'SUPER_SECRET_KEY');

        const user = await UserService.findeById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            userId: user.id,
            username: user.username,
            avatar: user.avatar || 'assets/images/default-avatar.png',
            wins: user.wins || 0,
            losses: user.losses || 0,
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
        
        const leaderboard = players.map((p, index) => ({
            rank: index + 1,
            userId: p.id,
            username: p.username,
            wins: p.wins || 0,
            losses: p.losses || 0,
            winRate: p.wins + p.losses > 0 
                ? Math.round((p.wins / (p.wins + p.losses)) * 100) 
                : 0
        }));

        res.json(leaderboard);
    }
    catch (err) {
        console.error('Error in /api/leaderboard:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});