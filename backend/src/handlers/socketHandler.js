const User = require('../entities/User');
const Cards = require('../models/Cards');
const BattleService = require('../services/BattleService');
const UserService = require('../services/UserService');
const { Server } = require('socket.io');

// In-Memory Game States shared across websocket sessions
const queue = [];
const games = new Map();
const preGames = new Map();
const gameTurnTimers = new Map();

/**
 * Initializes and binds all Socket.io event listeners for matchmaking and real-time game loops.
 * @param {Object} io - The Socket.io Server instance.
 */
function initSocketHandler(io) {
    io.on('connection', (socket) => {
        console.log('connected', socket.id);

        /**
         * Event listener for entering the matchmaking queue.
         */
        socket.on('joinQueue', ({ userId, username }) => {
            if (queue.some(p => p.userId === userId)) return;

            queue.push({ socket, userId, username });

            if (queue.length >= 2) {
                const p1 = queue.shift();
                const p2 = queue.shift();
                startPreGame(p1, p2);
            }
        });

        /**
         * Event listener for manual queue cancellation.
         */
        socket.on('leaveQueue', () => {
            const index = queue.findIndex(p => p.socket.id === socket.id);
            if (index !== -1) queue.splice(index, 1);
            console.log(`Socket ${socket.id} left the queue.`);
        });

        /**
         * Event listener for cancelling a game while inside the card-selection pregame room.
         */
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

        /**
         * Event listener for connection dropouts and client-side closes.
         */
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

        /**
         * Event listener for selecting 3 starting field units from the pregame hand.
         */
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

                // ✅ Додаємо .catch() для обробки помилок
                startGame(currentPreGame, currentRoomId).catch(err => {
                    console.error('[Server] Error starting game:', err);
                    socket.emit('gameError', { message: 'Failed to start game' });
                    opponentObj.socket.emit('gameError', { message: 'Failed to start game' });
                });
            }
        });

        /**
         * Event listener for initiating attacks from an on-field card to a targeted slot or base.
         */
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

        socket.on('playCard', async ({ instanceId, slotIndex }) => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;
            if (game.currentTurnId !== player.userId) return;

            const cardIndex = player.hand.findIndex(c => c.instanceId === instanceId);
            const card = player.hand[cardIndex];
            if (!card) return;

            player.field[slotIndex] = card;
            player.hand.splice(cardIndex, 1);
            player.unitsDeployed++;

            const gameState1 = serializeGameStateForPlayer(game, game.p1.userId);
            _addTimerDataToGameState(gameState1, game);
            
            const gameState2 = serializeGameStateForPlayer(game, game.p2.userId);
            _addTimerDataToGameState(gameState2, game);
            const cardIdx = player.hand.findIndex(c => c.instanceId === instanceId);
            if (cardIdx === -1) return;

            const card = player.hand[cardIdx];

            if (slotIndex < 0 || slotIndex > 2 || player.field[slotIndex] !== null) return;

            player.field[slotIndex] = card;
            player.hand.splice(cardIdx, 1);
            player.unitsDeployed++;

            game.p1.socket.emit('gameStateUpdate', { game: gameState1 });
            game.p2.socket.emit('gameStateUpdate', { game: gameState2 });
        });

        socket.on('takeReserve', async () => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;
            if (game.currentTurnId !== player.userId || !player.reserveCard) return;

            player.hand.push(player.reserveCard);
            player.reserveCard = null;

            game.p1.socket.emit('gameStateUpdate', { game: serializeGameStateForPlayer(game, game.p1.userId) });
            game.p2.socket.emit('gameStateUpdate', { game: serializeGameStateForPlayer(game, game.p2.userId) });
        });

        socket.on('endTurn', async () => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const player = isP1 ? game.p1 : game.p2;
            if (game.currentTurnId !== player.userId) return;

            if (player.hand.length < 3) {
                const newCards = Cards._deal(3 - player.hand.length, player.side, player.usedIds);
                newCards.forEach(c => {
                    player.usedIds.push(c.id);
                    player.hand.push(c);
                });
            }

            _switchTurn(game);
        });

        socket.on('surrender', async () => {
            const { game, isP1 } = _getGameBySocket(socket.id);
            if (!game) return;

            const wPlayer = isP1 ? game.p2 : game.p1;
            const lPlayer = isP1 ? game.p1 : game.p2;

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
        });
    });

    /**
     * Finds a game instance by a socket connection ID and returns the game, as well as a p1-position flag.
     * @param {string} socketId - The Socket.io connection identifier string.
     * @returns {Object} { game, isP1 } where isP1 indicates if the socket is connected as player 1.
     * @private
     */
    function _getGameBySocket(socketId) {
        for (const [roomId, game] of games.entries()) {
            if (game.p1.socket.id === socketId) return { game, isP1: true };
            if (game.p2.socket.id === socketId) return { game, isP1: false };
        }
        return { game: null, isP1: false };
    }

    /**
     * Cycles turn owner id, updates metrics, resets turn timer, and multicasts filtered state updates.
     * @param {Object} game - The global game state object container.
     * @private
     */
    function _switchTurn(game) {
        if (gameTurnTimers.has(game.roomId)) {
            const oldTimer = gameTurnTimers.get(game.roomId);
            if (oldTimer.timeout) clearTimeout(oldTimer.timeout);
        }
        
        game.currentTurnId = game.currentTurnId === game.p1.userId ? game.p2.userId : game.p1.userId;
        game.turnNumber++;

        const turnStartTime = Date.now();
        const turnDuration = 30000;

        game.turnStartTime = turnStartTime; 

        const turnTimeout = setTimeout(() => {
            console.log(`[Server] Auto-ending turn for player ${game.currentTurnId} in room ${game.roomId}`);
            
            const currentPlayer = game.currentTurnId === game.p1.userId ? game.p1 : game.p2;
            
            if (currentPlayer.hand.length < 3) {
                const newCards = Cards._deal(3 - currentPlayer.hand.length, currentPlayer.side, currentPlayer.usedIds);
                newCards.forEach(c => {
                    currentPlayer.usedIds.push(c.id);
                    currentPlayer.hand.push(c);
                });
            }
            
            if (games.has(game.roomId)) {
                _switchTurn(game);
            }
        }, turnDuration);

        gameTurnTimers.set(game.roomId, { 
            startTime: turnStartTime, 
            duration: 30,
            timeout: turnTimeout 
        });

        const gameState1 = serializeGameStateForPlayer(game, game.p1.userId);
        _addTimerDataToGameState(gameState1, game);
        
        const gameState2 = serializeGameStateForPlayer(game, game.p2.userId);
        _addTimerDataToGameState(gameState2, game);

        game.p1.socket.emit('gameStateUpdate', { game: gameState1 });
        game.p2.socket.emit('gameStateUpdate', { game: gameState2 });
    }

    /**
     * Runs win/loss lifecycle conditional logic checks, fires gameOver events and records to DB.
     * @param {Object} game - The global game state object container.
     * @returns {Promise<boolean>} True if the game is successfully concluded, false otherwise.
     * @private
     */
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

    /**
     * Initializes pregame match data layout rooms, randomizes sides, deals initial 7 cards.
     * @param {Object} p1 - Player 1 metadata structure wrapper.
     * @param {Object} p2 - Player 2 metadata structure wrapper.
     * @private
     */
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

    /**
     * Packages and maps a sanitized sub-state object context specifically structured for the client view.
     * @param {Object} globalState - Full master server game session state container.
     * @param {number} targetUserId - Active viewer user database ID to partition perspective for.
     * @returns {Object} Filtered object state mapping card indices safely.
     * @private
     */
    function serializeGameStateForPlayer(globalState, targetUserId) {
        const p1Id = globalState.p1.userId;
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
                hp: activePlayer.hp,
                side: activePlayer.side,
                hand: activePlayer.hand,
                field: activePlayer.field,
                reserveCard: activePlayer.reserveCard,
                usedIds: activePlayer.usedIds,
                avatar: activePlayer.avatar || null,
                avatar_preset: activePlayer.avatar_preset || null
            },
            opponent: {
                userId: opponentPlayer.userId,
                username: opponentPlayer.username,
                hp: opponentPlayer.hp,
                side: opponentPlayer.side,
                handCount: opponentPlayer.hand.length, 
                field: opponentPlayer.field,
                reserveCard: opponentPlayer.reserveCard,
                usedIds: opponentPlayer.usedIds,
                avatar: opponentPlayer.avatar || null,
                avatar_preset: opponentPlayer.avatar_preset || null
            }
        };
    }

    /**
     * Constructs active server match room layouts by sorting selected units from active hand layouts.
     * @param {Object} preGameData - Aggregated pregame room information storage structure.
     * @param {string} roomId - Generated target room room string locator identifier.
     * @private
     */
    async function startGame(preGameData, roomId) {
        const { p1, p2 } = preGameData;

        const p1Hand = p1.allCards.filter(c => !p1.selectedIds.includes(c.instanceId));
        const p1Field = [null, null, null];
        p1.allCards.filter(c => p1.selectedIds.includes(c.instanceId)).forEach((c, i) => { p1Field[i] = c; });

        const p2Hand = p2.allCards.filter(c => !p2.selectedIds.includes(c.instanceId));
        const p2Field = [null, null, null];
        p2.allCards.filter(c => p2.selectedIds.includes(c.instanceId)).forEach((c, i) => { p2Field[i] = c; });

        const p1Data = await UserService.findById(p1.userId);
        const p2Data = await UserService.findById(p2.userId);

        let p1AvatarUrl = null;
        if (p1Data && p1Data.avatar) {
            const base64Image = Buffer.from(p1Data.avatar).toString('base64');
            p1AvatarUrl = `data:image/jpeg;base64,${base64Image}`;
        }

        let p2AvatarUrl = null;
        if (p2Data && p2Data.avatar) {
            const base64Image = Buffer.from(p2Data.avatar).toString('base64');
            p2AvatarUrl = `data:image/jpeg;base64,${base64Image}`;
        }

        const turnStartTime = Date.now();
        const turnDuration = 30000;

        const globalGameState = {
            roomId,
            turnNumber: 1,
            currentTurnId: Math.random() < 0.5 ? p1.userId : p2.userId,
            turnTimeLeft: 30,
            turnStartTime: turnStartTime,
            turnServerTime: Date.now(),
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
                unitsDeployed: 3,
                avatar: p1AvatarUrl,
                avatar_preset: p1Data ? p1Data.avatar_preset : null
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
                unitsDeployed: 3,
                avatar: p2AvatarUrl,
                avatar_preset: p2Data ? p2Data.avatar_preset : null
            }
        };

        games.set(roomId, globalGameState);
        preGames.delete(roomId);

        const turnTimeout = setTimeout(() => {
            console.log(`[Server] Auto-ending turn for player ${globalGameState.currentTurnId}`);
            const currentPlayer = globalGameState.currentTurnId === globalGameState.p1.userId ? globalGameState.p1 : globalGameState.p2;
            
            if (currentPlayer.hand.length < 3) {
                const newCards = Cards._deal(3 - currentPlayer.hand.length, currentPlayer.side, currentPlayer.usedIds);
                newCards.forEach(c => {
                    currentPlayer.usedIds.push(c.id);
                    currentPlayer.hand.push(c);
                });
            }
            
            if (games.has(roomId)) {
                _switchTurn(globalGameState);
            }
        }, turnDuration);

        gameTurnTimers.set(roomId, { 
            startTime: turnStartTime, 
            duration: 30,
            timeout: turnTimeout 
        });

        const gameState1 = serializeGameStateForPlayer(globalGameState, p1.userId);
        gameState1.turnStartTime = turnStartTime;
        gameState1.serverTime = Date.now();
        
        const gameState2 = serializeGameStateForPlayer(globalGameState, p2.userId);
        gameState2.turnStartTime = turnStartTime;
        gameState2.serverTime = Date.now();

        p1.socket.emit('gameStart', gameState1);
        p2.socket.emit('gameStart', gameState2);
    }

    function _addTimerDataToGameState(gameState, game) {
    gameState.turnStartTime = game.turnStartTime;
    gameState.serverTime = Date.now();
    gameState.turnTimeLeft = 30; 
    return gameState;
}
}

module.exports = { initSocketHandler };