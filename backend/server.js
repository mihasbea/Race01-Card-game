const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db');

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