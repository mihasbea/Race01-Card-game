const mockSocket = (() => {
    const _handlers = {};
    let _pgState = null; 

    function on(event, cb) {
        if (!_handlers[event]) _handlers[event] = [];
        _handlers[event].push(cb);
    }

    function off(event, cb) {
        if (_handlers[event]) _handlers[event] = _handlers[event].filter(f => f !== cb);
    }

    function _trigger(event, data) {
        (_handlers[event] || []).forEach(f => f(data));
    }

    const ALL_HEROES = [
        { id: 'ironman',    name: 'IRON MAN',      alias: 'Tony Stark',        atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-ironman',    sym: '⚙' },
        { id: 'thor',       name: 'THOR',           alias: 'God of Thunder',    atk: 10, def: 3, cost: 6, hp: 12, art: 'art-thor',       sym: '⚡' },
        { id: 'cap',        name: 'CAPT. AMERICA',  alias: 'Steve Rogers',      atk: 7,  def: 9, cost: 5, hp: 14, art: 'art-cap',        sym: '★' },
        { id: 'hulk',       name: 'HULK',           alias: 'Bruce Banner',      atk: 12, def: 2, cost: 7, hp: 14, art: 'art-hulk',       sym: '💪' },
        { id: 'strange',    name: 'DR. STRANGE',    alias: 'Sorcerer Supreme',  atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-strange',    sym: '🌀' },
        { id: 'spiderman',  name: 'SPIDER-MAN',     alias: 'Peter Parker',      atk: 7,  def: 7, cost: 5, hp: 14, art: 'art-spiderman',  sym: '🕷' },
        { id: 'widow',      name: 'BLACK WIDOW',    alias: 'Nat. Romanoff',     atk: 6,  def: 6, cost: 4, hp: 8,  art: 'art-widow',      sym: '🕸' },
        { id: 'panther',    name: 'BLACK PANTHER',  alias: "T'Challa",          atk: 8,  def: 8, cost: 6, hp: 12, art: 'art-panther',    sym: '🐾' },
        { id: 'hawkeye',    name: 'HAWKEYE',        alias: 'Clint Barton',      atk: 7,  def: 4, cost: 4, hp: 8,  art: 'art-hawkeye',    sym: '🏹' },
        { id: 'antman',     name: 'ANT-MAN',        alias: 'Scott Lang',        atk: 6,  def: 5, cost: 4, hp: 8,  art: 'art-antman',     sym: '🐜' },
        { id: 'wanda',      name: 'SCARLET WITCH',  alias: 'Wanda Maximoff',    atk: 11, def: 4, cost: 7, hp: 14, art: 'art-wanda',      sym: '🔮' },
        { id: 'vision',     name: 'VISION',         alias: 'Synthezoid',        atk: 8,  def: 7, cost: 6, hp: 12, art: 'art-vision',     sym: '💎' },
        { id: 'bucky',      name: 'WINTER SOLDIER', alias: 'Bucky Barnes',      atk: 9,  def: 5, cost: 5, hp: 10, art: 'art-bucky',      sym: '🔫' },
        { id: 'falcon',     name: 'FALCON',         alias: 'Sam Wilson',        atk: 7,  def: 6, cost: 5, hp: 10, art: 'art-falcon',     sym: '🦅' },
        { id: 'warmachine', name: 'WAR MACHINE',    alias: 'James Rhodes',      atk: 9,  def: 7, cost: 7, hp: 14, art: 'art-warmachine', sym: '🔧' },
    ];

    const ALL_VILLAINS = [
        { id: 'thanos',      name: 'THANOS',        alias: 'The Mad Titan',     atk: 13, def: 7, cost: 9, hp: 18, art: 'art-thanos',     sym: '∞' },
        { id: 'loki',        name: 'LOKI',          alias: 'God of Mischief',   atk: 6,  def: 7, cost: 5, hp: 10, art: 'art-loki',       sym: '⚗' },
        { id: 'ultron',      name: 'ULTRON',        alias: 'Genocidal AI',      atk: 9,  def: 4, cost: 6, hp: 12, art: 'art-ultron',     sym: '🤖' },
        { id: 'hela',        name: 'HELA',          alias: 'Goddess of Death',  atk: 11, def: 5, cost: 7, hp: 14, art: 'art-hela',       sym: '⚰' },
        { id: 'magneto',     name: 'MAGNETO',       alias: 'Erik Lehnsherr',    atk: 9,  def: 8, cost: 7, hp: 14, art: 'art-magneto',    sym: '🧲' },
        { id: 'venom',       name: 'VENOM',         alias: 'Eddie Brock',       atk: 10, def: 3, cost: 6, hp: 12, art: 'art-venom',      sym: '🖤' },
        { id: 'redskull',    name: 'RED SKULL',     alias: 'Johann Schmidt',    atk: 8,  def: 6, cost: 6, hp: 12, art: 'art-redskull',   sym: '💀' },
        { id: 'modok',       name: 'M.O.D.O.K.',    alias: 'Mental Organism',   atk: 10, def: 5, cost: 7, hp: 14, art: 'art-modok',      sym: '🧠' },
        { id: 'crossbones',  name: 'CROSSBONES',    alias: 'Brock Rumlow',      atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-crossbones', sym: '✖' },
        { id: 'dormammu',    name: 'DORMAMMU',      alias: 'Dark Dimension',    atk: 12, def: 6, cost: 8, hp: 16, art: 'art-dormammu',   sym: '🌑' },
        { id: 'taskmaster',  name: 'TASKMASTER',    alias: 'Tony Masters',      atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-taskmaster', sym: '🎭' },
        { id: 'abomination', name: 'ABOMINATION',   alias: 'Emil Blonsky',      atk: 11, def: 4, cost: 7, hp: 14, art: 'art-abomination',sym: '☢' },
        { id: 'whiplash',    name: 'WHIPLASH',      alias: 'Ivan Vanko',        atk: 8,  def: 4, cost: 5, hp: 10, art: 'art-whiplash',   sym: '⚡' },
        { id: 'ronan',       name: 'RONAN',         alias: 'The Accuser',       atk: 10, def: 7, cost: 7, hp: 14, art: 'art-ronan',      sym: '🔨' },
        { id: 'goblin',      name: 'GREEN GOBLIN',  alias: 'Norman Osborn',     atk: 9,  def: 5, cost: 6, hp: 12, art: 'art-goblin',     sym: '🎃' },
    ];

    function _pool(side) { return side === 'hero' ? ALL_HEROES : ALL_VILLAINS; }

    function _deal(n, side, usedIds) {
        const usedSet = new Set(usedIds);
        const available = _pool(side).filter(c => !usedSet.has(c.id));
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n).map((base, i) => ({
            ...base,
            currentHp: base.hp,
            instanceId: base.id + '-' + Date.now() + '-' + i,
        }));
    }

    function _resolveAttack(attacker, fieldArr, targetSlot, defenderState) {
        const target = fieldArr[targetSlot];
        if (!target || !attacker) return false;
        const dmg = Math.max(1, attacker.atk - target.def);
        target.currentHp -= dmg;
        if (target.currentHp <= 0) {
            defenderState.hp -= target.cost;
            fieldArr[targetSlot] = null;
            const newCards = _deal(1, defenderState.side, defenderState.usedIds);
            if (newCards.length > 0) {
                defenderState.usedIds = [...defenderState.usedIds, newCards[0].id];
                defenderState.reserveCard = newCards[0];
            }
            return true;
        }
        return false;
    }

    function _checkGameOver(state) {
        if (state.you.hp <= 0) {
            _trigger('gameOver', { winner: 'opponent', reason: 'HP depleted' });
            return true;
        }
        if (state.opponent.hp <= 0) {
            _trigger('gameOver', { winner: 'you', reason: 'HP depleted' });
            return true;
        }
        const youHas = state.you.hand.length > 0 || state.you.field.some(Boolean) || !!state.you.reserveCard;
        const oppHas = state.opponent.handCount > 0 || state.opponent.field.some(Boolean) || !!state.opponent.reserveCard;
        if (!youHas) {
            _trigger('gameOver', { winner: 'opponent', reason: 'No cards remaining' });
            return true;
        }
        if (!oppHas) {
            _trigger('gameOver', { winner: 'you', reason: 'No cards remaining' });
            return true;
        }
        return false;
    }

    function _doOpponentTurn(state) {
        state.currentTurn = 'opponent';
        state.turnNumber++;
        _trigger('gameStateUpdate', { game: state });

        setTimeout(() => {
            if (state.opponent.reserveCard) {
                state.opponent._hand = state.opponent._hand || [];
                state.opponent._hand.push(state.opponent.reserveCard);
                state.opponent.handCount++;
                state.opponent.reserveCard = null;
                state.currentTurn = 'you';
                state.turnTimeLeft = 30;
                _trigger('gameStateUpdate', { game: state });
                return;
            }

            const freeSlot = state.opponent.field.findIndex(s => s === null);
            if (freeSlot !== -1 && state.opponent._hand && state.opponent._hand.length > 0) {
                const card = state.opponent._hand.shift();
                state.opponent.field[freeSlot] = { ...card };
                state.opponent.handCount = Math.max(0, state.opponent.handCount - 1);
                if (!_checkGameOver(state)) {
                    state.currentTurn = 'you';
                    state.turnTimeLeft = 30;
                    _trigger('gameStateUpdate', { game: state });
                }
                return;
            }

            const oppAttackerIdx = state.opponent.field.reduce((best, c, i) => {
                if (!c) return best;
                return (best === -1 || c.atk > state.opponent.field[best].atk) ? i : best;
            }, -1);

            if (oppAttackerIdx !== -1) {
                const oppAttacker = state.opponent.field[oppAttackerIdx];
                const yourCardIdx = state.you.field.findIndex(Boolean);

                // Fire animation event first, then resolve after delay
                _trigger('opponentAttack', {
                    attackerSlot: oppAttackerIdx,
                    targetSlot:   yourCardIdx,   // -1 = direct attack on avatar
                    attackerName: oppAttacker.name,
                });

                setTimeout(() => {
                    if (yourCardIdx !== -1) {
                        _resolveAttack(oppAttacker, state.you.field, yourCardIdx, state.you);
                    } else {
                        state.you.hp -= oppAttacker.atk;
                    }
                    if (!_checkGameOver(state)) {
                        state.currentTurn = 'you';
                        state.turnTimeLeft = 30;
                        _trigger('gameStateUpdate', { game: state });
                    }
                }, 950);
            } else {
                if (!_checkGameOver(state)) {
                    state.currentTurn = 'you';
                    state.turnTimeLeft = 30;
                    _trigger('gameStateUpdate', { game: state });
                }
            }
        }, 2000);
    }

    function _tryStartGame() {
        if (!_pgState || !_pgState.yourReady || !_pgState.oppReady) return;
        const pg = _pgState;
        _pgState = null;

        const state = {
            roomId: 'room-' + Math.random().toString(36).slice(2, 6),
            turnNumber: 1,
            currentTurn: Math.random() < 0.5 ? 'you' : 'opponent',
            turnTimeLeft: 30,
            you: {
                userId:   window.gameState.userId || 'u1',
                username: window.gameState.username || 'Commander',
                avatar:   window.gameState.avatar,
                hp:       20,
                side:     pg.yourSide,
                hand:     pg.yourReserve,
                field:    [null, null, null],
                reserveCard: null,
                usedIds:  pg.yourUsedIds,
            },
            opponent: {
                userId:   'u2',
                username: 'Opponent',
                hp:       20,
                side:     pg.oppSide,
                handCount: pg.oppReserve.length,
                field:    [null, null, null],
                reserveCard: null,
                usedIds:  pg.oppUsedIds,
                _hand:    [...pg.oppReserve],
            },
        };

        pg.yourSelected.forEach((card, i) => { state.you.field[i] = { ...card }; });
        pg.oppSelected.forEach((card, i)  => { state.opponent.field[i] = { ...card }; });

        _trigger('gameStart', state);

        if (state.currentTurn === 'opponent') {
            setTimeout(() => _doOpponentTurn(state), 1500);
        }
    }

    function emit(event, data) {
        console.log('[Socket] emit:', event, data);

        switch (event) {

            case 'joinQueue':
                setTimeout(() => {
                    const yourSide = Math.random() < 0.5 ? 'hero' : 'villain';
                    const oppSide  = yourSide === 'hero' ? 'villain' : 'hero';
                    const yourCards = _deal(7, yourSide, []);
                    const oppCards  = _deal(7, oppSide,  []);
                    _pgState = {
                        yourSide, oppSide, yourCards, oppCards,
                        yourUsedIds: yourCards.map(c => c.id),
                        oppUsedIds:  oppCards.map(c => c.id),
                        yourReady: false, oppReady: false,
                        yourSelected: null, yourReserve: null,
                        oppSelected:  null, oppReserve:  null,
                    };
                    _trigger('preGame', { side: yourSide, cards: yourCards });
                }, 2000);
                break;
                
            case 'selectCards': {
                if (!_pgState) return;
                const sel = _pgState.yourCards.filter(c => data.selectedIds.includes(c.instanceId));
                const res = _pgState.yourCards.filter(c => !data.selectedIds.includes(c.instanceId));
                _pgState.yourSelected = sel;
                _pgState.yourReserve  = res;
                _pgState.yourReady    = true;

                if (!_pgState.oppReady) {
                    const shuffled = [..._pgState.oppCards].sort(() => Math.random() - 0.5);
                    _pgState.oppSelected = shuffled.slice(0, 3);
                    _pgState.oppReserve  = shuffled.slice(3);
                    _pgState.oppReady    = true;
                }

                _trigger('selectionConfirmed', { waiting: false });
                _tryStartGame();
                break;
            }

            case 'playCard':
                setTimeout(() => {
                    const state = window.gameState.game;
                    if (!state || state.currentTurn !== 'you') return;
                    const card = state.you.hand.find(c =>
                        data.instanceId ? c.instanceId === data.instanceId : c.id === data.cardId
                    );
                    if (!card) return;
                    const slot = data.slotIndex;
                    if (slot < 0 || slot > 2 || state.you.field[slot] !== null) return;
                    const idx = state.you.hand.findIndex(c => c.instanceId === card.instanceId);
                    if (idx !== -1) state.you.hand.splice(idx, 1);
                    state.you.field[slot] = { ...card };
                    _trigger('gameStateUpdate', { game: state });
                    setTimeout(() => _doOpponentTurn(state), 500);
                }, 200);
                break;

            case 'takeReserve':
                setTimeout(() => {
                    const state = window.gameState.game;
                    if (!state || state.currentTurn !== 'you' || !state.you.reserveCard) return;
                    state.you.hand.push(state.you.reserveCard);
                    state.you.reserveCard = null;
                    _trigger('gameStateUpdate', { game: state });
                    setTimeout(() => _doOpponentTurn(state), 500);
                }, 200);
                break;

            case 'attack': {
                setTimeout(() => {
                    const state = window.gameState.game;
                    if (!state || state.currentTurn !== 'you') return;
                    const attacker = state.you.field[data.attackerSlot];
                    if (!attacker) return;
                    if (data.targetSlot === -1) {
                        if (state.opponent.field.some(Boolean)) return;
                        state.opponent.hp -= attacker.atk;
                    } else {
                        _resolveAttack(attacker, state.opponent.field, data.targetSlot, state.opponent);
                    }
                    if (_checkGameOver(state)) return;
                    _trigger('gameStateUpdate', { game: state });
                    setTimeout(() => _doOpponentTurn(state), 500);
                }, 300);
                break;
            }

            case 'surrender':
                setTimeout(() => _trigger('gameOver', { winner: 'opponent', reason: 'surrender' }), 200);
                break;

            default:
                console.warn('[Socket] Unknown event:', event);
        }
    }

    return { on, off, emit };
})();


const socket = io("http://localhost:3000");

const appSocket = {

    on(event, cb) {
        socket.on(event, cb);
    },

    off(event, cb) {
        socket.off(event, cb);
    },

    emit(event, data) {
        socket.emit(event, data);
    }
};

window.appSocket = appSocket;