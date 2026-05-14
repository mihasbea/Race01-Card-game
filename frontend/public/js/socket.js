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
        { id: 'ironman',    name: 'Iron Man',      alias: 'Tony Stark',        atk: 8,  def: 6, cost: 6, hp: 12, art: 'art-ironman' },
        { id: 'thor',       name: 'Thor',          alias: 'Thor Odinson',      atk: 10, def: 6, cost: 7, hp: 12, art: 'art-thor' },
        { id: 'cap',        name: 'Captain America', alias: 'Steve Rogers',    atk: 7,  def: 8, cost: 5, hp: 10, art: 'art-cap' },
        { id: 'hulk',       name: 'Hulk',          alias: 'Bruce Banner',      atk: 11, def: 4, cost: 7, hp: 15, art: 'art-hulk' },
        { id: 'strange',    name: 'Doctor Strange', alias: 'Stephen Strange',   atk: 9,  def: 6, cost: 6, hp: 13, art: 'art-strange' },
        { id: 'spiderman',  name: 'Spider-Man',    alias: 'Peter Parker',      atk: 7,  def: 8, cost: 5, hp: 9,  art: 'art-spiderman' },
        { id: 'widow',      name: 'Black Widow',    alias: 'Natasha Romanoff',  atk: 6,  def: 5, cost: 4, hp: 11, art: 'art-widow' },
        { id: 'panther',    name: 'Black Panther',  alias: "T'Challa",          atk: 8,  def: 7, cost: 6, hp: 11, art: 'art-panther' },
        { id: 'hawkeye',    name: 'Hawkeye',        alias: 'Clint Barton',      atk: 7,  def: 3, cost: 3, hp: 8,  art: 'art-hawkeye' },
        { id: 'antman',     name: 'Ant-Man',        alias: 'Scott Lang',        atk: 6,  def: 6, cost: 4, hp: 9,  art: 'art-antman' },
        { id: 'wanda',      name: 'Scarlet Witch',  alias: 'Wanda Maximoff',    atk: 10, def: 4, cost: 6, hp: 11, art: 'art-wanda' },
        { id: 'vision',     name: 'Vision',         alias: 'Vision',            atk: 8,  def: 7, cost: 6, hp: 12, art: 'art-vision' },
        { id: 'bucky',      name: 'Winter Soldier', alias: 'Bucky Barnes',      atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-bucky' },
        { id: 'falcon',     name: 'Falcon',         alias: 'Sam Wilson',        atk: 6,  def: 5, cost: 4, hp: 9,  art: 'art-falcon' },
        { id: 'warmachine', name: 'War Machine',    alias: 'James Rhodes',      atk: 8,  def: 6, cost: 5, hp: 10, art: 'art-warmachine' },
    ];

    const ALL_VILLAINS = [
        { id: 'thanos',      name: 'Thanos',        alias: 'Thanos',            atk: 10, def: 5, cost: 7, hp: 15, art: 'art-thanos' },
        { id: 'loki',        name: 'Loki',          alias: 'Loki Laufeyson',    atk: 7,  def: 6, cost: 5, hp: 10, art: 'art-loki' },
        { id: 'ultron',      name: 'Ultron',        alias: 'Ultron',            atk: 7,  def: 7, cost: 6, hp: 12, art: 'art-ultron' },
        { id: 'hela',        name: 'Hela',          alias: 'Hela Odinsdottir',  atk: 9,  def: 7, cost: 7, hp: 12, art: 'art-hela' },
        { id: 'magneto',     name: 'Magneto',       alias: 'Erik Lehnsherr',    atk: 9,  def: 5, cost: 6, hp: 11, art: 'art-magneto' },
        { id: 'venom',       name: 'Venom',         alias: 'Eddie Brock',       atk: 9,  def: 6, cost: 6, hp: 11, art: 'art-venom' },
        { id: 'redskull',    name: 'Red Skull',     alias: 'Johann Schmidt',    atk: 8,  def: 7, cost: 5, hp: 10, art: 'art-redskull' },
        { id: 'modok',       name: 'M.O.D.O.K.',    alias: 'George Tarleton',   atk: 7,  def: 5, cost: 4, hp: 9,  art: 'art-modok' },
        { id: 'crossbones',  name: 'Crossbones',    alias: 'Brock Rumlow',      atk: 6,  def: 4, cost: 3, hp: 8,  art: 'art-crossbones' },
        { id: 'dormammu',    name: 'Dormammu',      alias: 'Dormammu',          atk: 10, def: 5, cost: 6, hp: 13, art: 'art-dormammu' },
        { id: 'taskmaster',  name: 'Taskmaster',    alias: 'Tony Masters',      atk: 7,  def: 4, cost: 4, hp: 11, art: 'art-taskmaster' },
        { id: 'abomination', name: 'Abomination',   alias: 'Emil Blonsky',      atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-abomination' },
        { id: 'whiplash',    name: 'Whiplash',      alias: 'Ivan Vanko',        atk: 9,  def: 5, cost: 5, hp: 10, art: 'art-whiplash' },
        { id: 'ronan',       name: 'Ronan',         alias: 'Ronan the Accuser', atk: 8,  def: 7, cost: 5, hp: 9,  art: 'art-ronan' },
        { id: 'goblin',      name: 'Green Goblin',  alias: 'Norman Osborn',     atk: 7,  def: 4, cost: 4, hp: 9,  art: 'art-goblin' },
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

window.appSocket = mockSocket;