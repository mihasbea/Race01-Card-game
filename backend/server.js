const fs = require('fs');
const express = require('express');
const path = require('path');
const pool = require('./src/config/db');
const jwt = require('jsonwebtoken');

const http = require('http');
const { Server } = require('socket.io');

const UserService = require('./src/services/UserService');
const BattleService = require('./src/services/BattleService');
const Cards = require('./cards');

const PORT = 3000;

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

    const server = http.createServer(app);
    const io = new Server(server, {
        cors: { origin: "*" }
    });

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

    const queue = [];
    const games = new Map();
    const users = new Map();
    const preGames = new Map();

    io.on('connection', (socket) => {
        console.log('connected', socket.id);

        socket.on('joinQueue', ({ userId, username }) => {
            if (queue.some(p => p.userId === userId)) return;

            queue.push({
                socket,
                userId,
                username
            });

            if (queue.length >= 2) {
                const p1 = queue.shift();
                const p2 = queue.shift();
                startPreGame(p1, p2);
            }
        });

        socket.on('leaveQueue', () => {
            queue = queue.filter(p => p.socket.id !== socket.id);
        });

        socket.on('selectCards', ({ selectedIds }) => { // Додано деструктуризацію selectedIds
            let currentPreGame = null;
            let currentRoomId = null; // Виправлено назву змінної на кумулятивну currentRoomId

            for (const [roomId, preGame] of preGames.entries()) {
                // Виправлено: pgState замінено на preGame, як і оголошено у циклі
                if (preGame.p1?.socket?.id === socket.id || preGame.p2?.socket?.id === socket.id) {
                    currentRoomId = roomId;
                    currentPreGame = preGame;
                    break;
                }
            }

            // Виправлено перевірку на наявність кімнати
            if (!currentPreGame || !currentRoomId) {
                console.warn(`[Server] selectCards received, but no pregame room found for socket ${socket.id}`);
                return;
            }

            const isP1 = currentPreGame.p1.socket.id === socket.id;
            const playerObj = isP1 ? currentPreGame.p1 : currentPreGame.p2;
            const opponentObj = isP1 ? currentPreGame.p2 : currentPreGame.p1;

            if (!selectedIds || selectedIds.length !== 3) {
                console.warn(`[Server] Invalid card selection length from ${playerObj.username}`);
                return;
            }

            playerObj.selectedIds = selectedIds;
            playerObj.ready = true;

            console.log(`[Server] Player ${playerObj.username} locked cards:`, selectedIds);

            if (!opponentObj.ready) {
                socket.emit('selectionConfirmed', { waiting: true });
            } else {
                socket.emit('selectionConfirmed', { waiting: false });
                opponentObj.socket.emit('selectionConfirmed', { waiting: false });

                startGame(currentPreGame, currentRoomId);
            }
        });

    });

    function startPreGame(p1, p2) {
        const roomId = 'room-' + Date.now();

        p1.socket.join(roomId);
        p2.socket.join(roomId);
        console.log(`Starting game between ${p1.username} and ${p2.username} in room ${roomId}`);
        
        const p1Side = Math.random() < 0.5 ? 'hero' : 'villain';
        const p2Side = p1Side === 'hero' ? 'villain' : 'hero';

        const p1Cards = Cards._deal(7, p1Side, []);
        const p2Cards = Cards._deal(7, p2Side,  []);

        preGames.set(roomId, {
            roomId,
            p1: { ...p1, side: p1Side, allCards: p1Cards, selectedIds: [], ready: false },
            p2: { ...p2, side: p2Side, allCards: p2Cards, selectedIds: [], ready: false }
        });

        io.to(p1.socket.id).emit('preGame', { side: p1Side, cards: p1Cards });
        io.to(p2.socket.id).emit('preGame', { side: p2Side, cards: p2Cards });
    }

    function startGame(preGameData, roomId) {
        const { p1, p2 } = preGameData;

        const p1Hand = p1.allCards.filter(c => !p1.selectedIds.includes(c.instanceId));
        const p1Field = p1.allCards.filter(c => p1.selectedIds.includes(c.instanceId));

        const p2Hand = p2.allCards.filter(c => !p2.selectedIds.includes(c.instanceId));
        const p2Field = p2.allCards.filter(c => p2.selectedIds.includes(c.instanceId));

        const gameState = {
            roomId,
            currentTurn: p1.userId,
            players: {
                [p1.userId]: {
                    username: p1.username,
                    hp: 20,
                    side: p1.side,
                    hand: p1Hand,   
                    field: p1Field  
                },
                [p2.userId]: {
                    username: p2.username,
                    hp: 20,
                    side: p2.side,
                    hand: p2Hand,     
                    field: p2Field    
                }
            }
        };

        games.set(roomId, gameState);
        
        preGames.delete(roomId);

        console.log(`[Server] Both players ready. Sending gameStart for room ${roomId}`);
        io.to(roomId).emit('gameStart', gameState);
    }

    function createGameState(p1, p2, roomId) {
        const p1Side = Math.random() < 0.5 ? 'hero' : 'villain';
        const p2Side = p1Side === 'hero' ? 'villain' : 'hero';
        return {
            roomId,

            currentTurn: p1.userId,

            players: {
                [p1.userId]: {
                    hp: 20,
                    side: p1Side,
                    hand: [],
                    field: [null, null, null]
                },

                [p2.userId]: {
                    hp: 20,
                    side: p2Side,
                    hand: [],
                    field: [null, null, null]
                }
            }
        };
    }

    server.listen(PORT, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

startServer();