const fs = require('fs');
const express = require('express');
const session = require('express-session');
const path = require('path');
const pool = require('./src/config/db');

const UserService = require('./src/services/UserService');
const BattleService = require('./src/services/BattleService');

const UserService = new UserService();
const BattleService = new BattleService();

const app = express();
app.use(express.json());

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const result = await UserService.register(username, email, password);
        
        res.status(201).json({
            token: result.token,
            username: result.username
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const result = await UserService.login(username, password);
        res.json({
            token: result.token,
            username: result.username
        });
    } catch (err) {
        res.status(401).json({ message: "Невірний логін або пароль" });
    }
});

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