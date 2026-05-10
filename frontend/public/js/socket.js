
//  MOCK SOCKET  (replace with io.connect() after connecting to the backend)
//
//  REAL SOCKET (uncomment after connecting to the server):
//  const socket = io(‘http://localhost:3000’, {
//    auth: { token: window.gameState.token }
//  });

const mockSocket = (() => {

    // Event handler dictionary: { eventName: [fn, fn, ...] }
    const _handlers = {};

  // Registering a handler
    function on(event, callback) {
        if (!_handlers[event]) _handlers[event] = [];
        _handlers[event].push(callback);
    }

    function off(event, callback) {
        if (_handlers[event]) {
            _handlers[event] = _handlers[event].filter(fn => fn !== callback);
        }
    }

    // Call all event handlers
    function _trigger(event, data) {
        (_handlers[event] || []).forEach(fn => fn(data));
    }

    // Sending an event (with simulated server response)
    function emit(event, data) {
        console.log(`[Socket] emit: ${event}`, data);

        switch (event) {
         //  joinQueue — the player is looking for a match
         //  After 2 seconds, we simulate a gameStart response
        case 'joinQueue':
            setTimeout(() => {
            _trigger('gameStart', {
                roomId: 'room-' + Math.random().toString(36).slice(2, 8),
                turnNumber: 1,
                currentTurn: 'you',
                turnTimeLeft: 30,

                you: {
                userId:   window.gameState.userId || 'u1',
                username: window.gameState.username || 'IronHero2099',
                avatar:   window.gameState.avatar,
                hp: 20,
                // 5 cards in the starting hand
                hand: _mockDealCards(5, 'hero'),
                field: [null, null, null],
                },
                opponent: {
                userId: 'u2',
                username: 'Villain42',
                avatar: 'frontend/assets/images/default-avatar.png',
                hp: 20,
                handCount: 5,
                field: [null, null, null],
                },
            });
            }, 2000);
            break;

        //  playCard — the player places a card on the field
        //  Parameters: { slotIndex: 0|1|2, cardId: 'ironman' }

        case 'playCard':
            setTimeout(() => {
            const state = window.gameState.game;
            if (!state) return;
            const card = state.you.hand.find(c => c.id === data.cardId);
            if (!card) return;

            // Remove from hand, place on field
            state.you.hand = state.you.hand.filter(c => c.id !== data.cardId);
            state.you.field[data.slotIndex] = card;

            _trigger('gameStateUpdate', { game: state });
            }, 200);
            break;

        //  attack — the player attacks an opponent's card
        //  Parameters: { attackerSlot: 0, targetSlot: 0 }
        
        case 'attack':
            setTimeout(() => {
            const state = window.gameState.game;
            if (!state) return;

            const attacker = state.you.field[data.attackerSlot];
            const target   = state.opponent.field[data.targetSlot];
            if (!attacker) return;

            if (target) {
                // Battle formula: attack exceeding defense removes HP
                const dmg = Math.max(0, attacker.atk - target.def);
                state.opponent.hp -= dmg;
                // If attack > defense — destroy opponent's card
                if (attacker.atk > target.def) {
                state.opponent.field[data.targetSlot] = null;
                }
                // If defense >= attack — opponent retaliates
                if (target.def >= attacker.atk) {
                attacker.hp = (attacker.hp || attacker.def) - 1;
                if (attacker.hp <= 0) state.you.field[data.attackerSlot] = null;
                }
            } else {
                // Direct hit to opponent's HP
                state.opponent.hp -= attacker.atk;
            }

            // Check for game over
            if (state.opponent.hp <= 0) {
                _trigger('gameOver', { winner: 'you', reason: 'HP depleted' });
                return;
            }

            _trigger('gameStateUpdate', { game: state });
            }, 300);
            break;

        //  endTurn — the player ends their turn
        //  The opponent "plays" their turn after 2 seconds

        case 'endTurn':
            setTimeout(() => {
            const state = window.gameState.game;
            if (!state) return;

            state.turnNumber++;
            state.currentTurn = 'opponent';
            _trigger('gameStateUpdate', { game: state });

            // Simulate opponent's turn after 2 seconds
            setTimeout(() => {
                // Opponent places a card on the first free slot
                const freeSlot = state.opponent.field.findIndex(s => s === null);
                if (freeSlot !== -1 && state.opponent.handCount > 0) {
                state.opponent.field[freeSlot] = _mockDealCards(1, 'villain')[0];
                state.opponent.handCount = Math.max(0, state.opponent.handCount - 1);
                }

                // Opponent attacks
                const oppCard = state.opponent.field.find(Boolean);
                const yourCard = state.you.field.find(Boolean);
                if (oppCard) {
                if (yourCard) {
                    const dmg = Math.max(0, oppCard.atk - yourCard.def);
                    state.you.hp -= dmg;
                } else {
                    state.you.hp -= oppCard.atk;
                }
                }

                if (state.you.hp <= 0) {
                _trigger('gameOver', { winner: 'opponent', reason: 'HP depleted' });
                return;
                }

                // The player draws a new card at the start of their turn
                const newCard = _mockDealCards(1, 'hero')[0];
                state.you.hand.push(newCard);
                state.currentTurn = 'you';
                state.turnTimeLeft = 30;

                _trigger('gameStateUpdate', { game: state });
            }, 2000);
            }, 400);
            break;

        //  surrender
        //  The player surrenders the game
        case 'surrender':
            setTimeout(() => {
            _trigger('gameOver', { winner: 'opponent', reason: 'surrender' });
            }, 200);
            break;

        default:
            console.warn(`[Socket] Невідома подія: ${event}`);
        }
    }

  //Private function: deal N cards
    function _mockDealCards(n, side) {
        const HERO_CARDS = [
        { id: 'ironman', name: 'IRON MAN', alias: 'Tony Stark', atk: 8,  def: 5, cost: 5, art: 'art-ironman', sym: '⚙' },
        { id: 'thor', name: 'THOR', alias: 'God of Thunder',   atk: 10, def: 3, cost: 6, art: 'art-thor', sym: '⚡' },
        { id: 'cap', name: 'CAPTAIN AMERICA', alias: 'Steve Rogers', atk: 7, def: 9, cost: 5, art: 'art-cap', sym: '★' },
        { id: 'hulk', name: 'HULK', alias: 'Bruce Banner', atk: 12, def: 2, cost: 7, art: 'art-hulk', sym: '💪' },
        { id: 'strange', name: 'DR. STRANGE', alias: 'Sorcerer Supreme', atk: 9, def: 6, cost: 6, art: 'art-strange', sym: '🌀' },
        { id: 'spiderman', name: 'SPIDER-MAN', alias: 'Peter Parker', atk: 7, def: 7, cost: 5, art: 'art-spiderman', sym: '🕷' },
        { id: 'widow', name: 'BLACK WIDOW', alias: 'Nat. Romanoff', atk: 6,  def: 6, cost: 4, art: 'art-widow', sym: '🕸' },
        { id: 'panther',    name: 'BLACK PANTHER',   alias: "T'Challa",  atk: 8,  def: 8, cost: 6, art: 'art-panther', sym: '🐾' },
        ];
        const VILLAIN_CARDS = [
        { id: 'thanos', name: 'THANOS', alias: 'The Mad Titan', atk: 13, def: 7, cost: 9, art: 'art-thanos', sym: '∞' },
        { id: 'loki', name: 'LOKI', alias: 'God of Mischief', atk: 6,  def: 7, cost: 5, art: 'art-loki', sym: '⚗' },
        { id: 'ultron', name: 'ULTRON', alias: 'Genocidal AI', atk: 9,  def: 4, cost: 6, art: 'art-ultron', sym: '🤖' },
        { id: 'hela', name: 'HELA', alias: 'Goddess of Death', atk: 11, def: 5, cost: 7, art: 'art-hela', sym: '⚰' },
        { id: 'magneto', name: 'MAGNETO', alias: 'Erik Lehnsherr', atk: 9,  def: 8, cost: 7, art: 'art-magneto', sym: '🧲' },
        { id: 'venom', name: 'VENOM', alias: 'Eddie Brock', atk: 10, def: 3, cost: 6, art: 'art-venom', sym: '🖤' },
        ];

        const pool = side === 'hero' ? HERO_CARDS : VILLAIN_CARDS;
        const result = [];
        for (let i = 0; i < n; i++) {
        const base = pool[Math.floor(Math.random() * pool.length)];
        // Clone with a unique instanceId (there may be multiple copies of the same map)
        result.push({ ...base, instanceId: base.id + '-' + Date.now() + '-' + i });
        }
        return result;
    }

    return { on, off, emit };
})();

// Apply globally
window.appSocket = mockSocket;