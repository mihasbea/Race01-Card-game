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
            const index = queue.findIndex(p => p.socket.id === socket.id);
            if (index !== -1) queue.splice(index, 1);
            console.log(`Socket ${socket.id} left the queue.`);
        });

        socket.on('cancelPregame', () => {
            let currentRoomId = null;
            let preGame = null;

            for (const [roomId, pg] of preGames.entries()) {
                if (pg.p1?.socket?.id === socket.id || pg.p2?.socket?.id === socket.id) {
                    currentRoomId = roomId;
                    preGame = pg;
                    break;
                }
            }

            if (currentRoomId && preGame) {
                console.log(`[Server] Pregame room ${currentRoomId} cancelled by socket ${socket.id}.`);
                
                const opponent = preGame.p1.socket.id === socket.id ? preGame.p2 : preGame.p1;
                if (opponent && opponent.socket) {
                    opponent.socket.emit('pregameCancelled');
                }

                if (preGame.p1?.socket) preGame.p1.socket.leave(currentRoomId);
                if (preGame.p2?.socket) preGame.p2.socket.leave(currentRoomId);
                
                preGames.delete(currentRoomId);
            }
        });

        socket.on('disconnect', () => {
            console.log('disconnected', socket.id);
            
            const qIndex = queue.findIndex(p => p.socket.id === socket.id);
            if (qIndex !== -1) queue.splice(qIndex, 1);

            let currentRoomId = null;
            let preGame = null;
            
            for (const [roomId, pg] of preGames.entries()) {
                if (pg.p1?.socket?.id === socket.id || pg.p2?.socket?.id === socket.id) {
                    currentRoomId = roomId;
                    preGame = pg;
                    break;
                }
            }

            if (currentRoomId && preGame) {
                console.log(`[Server] Pregame room ${currentRoomId} destroyed due to player disconnect.`);
                
                const opponent = preGame.p1.socket.id === socket.id ? preGame.p2 : preGame.p1;
                if (opponent && opponent.socket) {
                    opponent.socket.emit('pregameCancelled');
                    opponent.socket.leave(currentRoomId);
                }

                if (preGame.p1?.socket) preGame.p1.socket.leave(currentRoomId);
                if (preGame.p2?.socket) preGame.p2.socket.leave(currentRoomId);

                preGames.delete(currentRoomId);
            }
        });

        socket.on('selectCards', ({ selectedIds }) => { 
            let currentPreGame = null;
            let currentRoomId = null;

            for (const [roomId, preGame] of preGames.entries()) {
                if (preGame.p1?.socket?.id === socket.id || preGame.p2?.socket?.id === socket.id) {
                    currentRoomId = roomId;
                    currentPreGame = preGame;
                    break;
                }
            }

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

        socket.on('attack', async ({ attackerSlot, targetSlot }) => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;
            const opponent = isP1 ? game.p2 : game.p1;

            if (game.currentTurnId !== player.userId) return;

            const attackerCard = player.field[attackerSlot];
            if (!attackerCard) return;

            opponent.socket.emit('opponentAttack', {
                attackerSlot,
                targetSlot,
                attackerName: attackerCard.name
            });

            setTimeout(async () => {

                if (targetSlot === -1) {

                    if (opponent.field.some(Boolean)) return;

                    opponent.hp -= attackerCard.atk;

                } else {

                    const targetCard = opponent.field[targetSlot];

                    if (!targetCard) return;

                    const dmg = Math.max(1, attackerCard.atk - targetCard.def);

                    targetCard.currentHp -= dmg;

                    if (targetCard.currentHp <= 0) {

                        opponent.hp -= targetCard.cost;

                        opponent.field[targetSlot] = null;

                        const newCards = Cards._deal(1, opponent.side, opponent.usedIds);

                        if (newCards.length > 0) {
                            opponent.usedIds.push(newCards[0].id);
                            opponent.reserveCard = newCards[0];
                        }
                    }
                }

                if (await _checkGameOver(game)) return;

                _switchTurn(game);

            }, 950);
        });

        socket.on('playCard', async ({ cardId, instanceId, slotIndex }) => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;

            if (game.currentTurnId !== player.userId) return;
            if (slotIndex < 0 || slotIndex > 2 || player.field[slotIndex] !== null) return;

            const cardIdx = player.hand.findIndex(c => c.instanceId === instanceId);
            if (cardIdx === -1) return;

            const card = player.hand.splice(cardIdx, 1)[0];
            player.field[slotIndex] = card;

            player.unitsDeployedCount++;

            if (await _checkGameOver(game)) return;

            _switchTurn(game);
        });

        socket.on('takeReserve', async () => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;
            if (game.currentTurnId !== player.userId || !player.reserveCard) return;

            player.hand.push(player.reserveCard);
            player.reserveCard = null;

            if (await _checkGameOver(game)) return;
            _switchTurn(game);
        });

        socket.on('surrender', async () => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const loser = isP1 ? game.p1 : game.p2;
            const winner = isP1 ? game.p2 : game.p1;

            winner.socket.emit('gameOver', { winner: 'you' });
            loser.socket.emit('gameOver', { winner: 'opponent' });

            await BattleService.saveBattleResult({
                p1Id: game.p1.userId,
                p2Id: game.p2.userId,
                winnerId: winner.userId,
                turns: game.turnNumber,
                unitsDeployed: (game.p1.usedIds?.length || 0) + (game.p2.usedIds?.length || 0)
            });

            games.delete(game.roomId);
        });
    });

    function _getGameBySocket(socketId) {
        for (const [roomId, game] of games.entries()) {
            if (game.p1.socket.id === socketId) return { game, isP1: true };
            if (game.p2.socket.id === socketId) return { game, isP1: false };
        }
        return { game: null, isP1: false };
    }

    function _switchTurn(game) {
        game.currentTurnId = game.currentTurnId === game.p1.userId ? game.p2.userId : game.p1.userId;
        game.turnNumber++;
        game.turnTimeLeft = 30;

        game.p1.socket.emit('gameStateUpdate', { game: serializeGameStateForPlayer(game, game.p1.userId) });
        game.p2.socket.emit('gameStateUpdate', { game: serializeGameStateForPlayer(game, game.p2.userId) });
    }

    async function _checkGameOver(game) {
        let winner = null; 

        if (game.p1.hp <= 0) winner = 'p2';
        else if (game.p2.hp <= 0) winner = 'p1';
        
        const p1HasCards = game.p1.hand.length > 0 || game.p1.field.some(Boolean) || !!game.p1.reserveCard;
        const p2HasCards = game.p2.hand.length > 0 || game.p2.field.some(Boolean) || !!game.p2.reserveCard;

        if (!p1HasCards && winner === null) winner = 'p2';
        if (!p2HasCards && winner === null) winner = 'p1';

        if (winner) {
            const wPlayer = winner === 'p1' ? game.p1 : game.p2;
            const lPlayer = winner === 'p1' ? game.p2 : game.p1;

            wPlayer.socket.emit('gameOver', { winner: 'you' });
            lPlayer.socket.emit('gameOver', { winner: 'opponent' });

            await BattleService.saveBattleResult({
                p1Id: game.p1.userId,
                p2Id: game.p2.userId,
                winnerId: wPlayer.userId,
                turns: game.turnNumber,
                unitsDeployed: game.p1.unitsDeployed + game.p2.unitsDeployed
            });
            
            games.delete(game.roomId);
            return true;
        }
        return false;
    }

    function startPreGame(p1, p2) {
        const roomId = 'room-' + Date.now();

        p1.socket.join(roomId);
        p2.socket.join(roomId);
        console.log(`Starting game between ${p1.username} and ${p2.username} in room ${roomId}`);
        
        const p1Side = Math.random() < 0.5 ? 'hero' : 'villain';
        const p2Side = p1Side === 'hero' ? 'villain' : 'hero';

        const p1Cards = Cards._deal(7, p1Side, []);
        const p2Cards = Cards._deal(7, p2Side, []);

        preGames.set(roomId, {
            roomId,
            p1: { ...p1, side: p1Side, allCards: p1Cards, selectedIds: [], ready: false, usedIds: p1Cards.map(c => c.id) },
            p2: { ...p2, side: p2Side, allCards: p2Cards, selectedIds: [], ready: false, usedIds: p2Cards.map(c => c.id) }
        });

        io.to(p1.socket.id).emit('preGame', { side: p1Side, cards: p1Cards });
        io.to(p2.socket.id).emit('preGame', { side: p2Side, cards: p2Cards });
    }

    function serializeGameStateForPlayer(globalState, targetUserId) {
        const p1Id = globalState.p1.userId;
        const p2Id = globalState.p2.userId;

        const isTargetP1 = targetUserId === p1Id;
        const activePlayer = isTargetP1 ? globalState.p1 : globalState.p2;
        const opponentPlayer = isTargetP1 ? globalState.p2 : globalState.p1;

        const currentTurnString = globalState.currentTurnId === targetUserId ? 'you' : 'opponent';

        return {
            roomId: globalState.roomId,
            turnNumber: globalState.turnNumber,
            currentTurn: currentTurnString,
            turnTimeLeft: globalState.turnTimeLeft,
            you: {
                userId: activePlayer.userId,
                username: activePlayer.username,
                avatar: activePlayer.avatar || 'assets/images/default-avatar.png',
                hp: activePlayer.hp,
                side: activePlayer.side,
                hand: activePlayer.hand,
                field: activePlayer.field,
                reserveCard: activePlayer.reserveCard,
                usedIds: activePlayer.usedIds
            },
            opponent: {
                userId: opponentPlayer.userId,
                username: opponentPlayer.username,
                avatar: opponentPlayer.avatar || 'assets/images/default-avatar.png',
                hp: opponentPlayer.hp,
                side: opponentPlayer.side,
                handCount: opponentPlayer.hand.length, 
                field: opponentPlayer.field,
                reserveCard: opponentPlayer.reserveCard,
                usedIds: opponentPlayer.usedIds
            }
        };
    }

    function startGame(preGameData, roomId) {
        const { p1, p2 } = preGameData;

        const p1Hand = p1.allCards.filter(c => !p1.selectedIds.includes(c.instanceId));
        const p1Field = [null, null, null];
        p1.allCards.filter(c => p1.selectedIds.includes(c.instanceId)).forEach((c, i) => { p1Field[i] = c; });

        const p2Hand = p2.allCards.filter(c => !p2.selectedIds.includes(c.instanceId));
        const p2Field = [null, null, null];
        p2.allCards.filter(c => p2.selectedIds.includes(c.instanceId)).forEach((c, i) => { p2Field[i] = c; });

        const globalGameState = {
            roomId,
            turnNumber: 1,
            currentTurnId: Math.random() < 0.5 ? p1.userId : p2.userId,
            turnTimeLeft: 30,
            p1: {
                socket: p1.socket,
                userId: p1.userId,
                username: p1.username,
                hp: 20,
                side: p1.side,
                hand: p1Hand,
                field: p1Field,
                reserveCard: null,
                usedIds: p1.usedIds,
                unitsDeployedCount: 3
            },
            p2: {
                socket: p2.socket,
                userId: p2.userId,
                username: p2.username,
                hp: 20,
                side: p2.side,
                hand: p2Hand,
                field: p2Field,
                reserveCard: null,
                usedIds: p2.usedIds,
                unitsDeployedCount: 3
            }
        };

        games.set(roomId, globalGameState);
        preGames.delete(roomId);

        console.log(`[Server] Both players ready. Sending gameStart for room ${roomId}`);

        p1.socket.emit('gameStart', serializeGameStateForPlayer(globalGameState, p1.userId));
        p2.socket.emit('gameStart', serializeGameStateForPlayer(globalGameState, p2.userId));
    }

    server.listen(PORT, () => {
        console.log('Server is running on http://localhost:3000');
    });
}

startServer();