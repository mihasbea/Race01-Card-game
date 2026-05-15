let selectedCard  = null;  // { type: 'hand'|'board', index, card }
let pendingAttack = null;  // { attackerSlot, targetSlot }
let _timerInterval = null;

function _startTimer(seconds) {
    _clearTimer();
    let remaining = seconds;
    _updateTimerDOM(remaining);
    _timerInterval = setInterval(() => {
        remaining--;
        _updateTimerDOM(remaining);
        if (remaining <= 0) {
            _clearTimer();

            const game = window.gameState.game;
            if (game && game.currentTurn === 'you') {
                _clearSelection();
                
                if (pendingAttack) {
                    window.appSocket.emit('attack', pendingAttack);
                }
                
                _setActionState(false);
            }
        }
    }, 1000);
}

function _clearTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
}

function _updateTimerDOM(seconds) {
    const el = document.getElementById('game-timer-val');
    if (!el) return;
    el.textContent = seconds;
    const ring = el.closest('.timer-ring');
    if (ring) ring.classList.toggle('warning', seconds <= 10);
}

const JARVIS_LINES = [
    'Tactical overlay active. Awaiting your command.',
    'Threat signature at elevated capacity. Offensive posture recommended.',
    'Power core stable. All combat systems nominal.',
    'Analyzing threat patterns — countermeasure protocol loaded.',
    'Probability matrix: flanking yields 71% success rate.',
    'Strategic withdrawal remains a valid contingency.',
    'I have cross-referenced 4,712 scenarios. Deploy the Hulk.',
];
let _jarvisIdx = 0;
let _jarvisInterval = null;

function _cycleJarvis() {
    const el = document.getElementById('game-jarvis');
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = JARVIS_LINES[_jarvisIdx % JARVIS_LINES.length];
        el.style.opacity = '1';
        _jarvisIdx++;
    }, 300);
}

function renderGamePage(container) {
    const game = window.gameState.game;
    if (!game) { window.appRouter.navigate('lobby'); return; }

    _clearTimer();
    if (_jarvisInterval) clearInterval(_jarvisInterval);
    selectedCard = null;
    pendingAttack = null;

    container.innerHTML = _buildLayout(game);
    _attachSocketListeners();
    _startTimer(game.turnTimeLeft || 30);
    _jarvisInterval = setInterval(_cycleJarvis, 7000);
    _cycleJarvis();
    _setActionState(game.currentTurn === 'you');
}

function _buildLayout(game) {
    const isMyTurn  = game.currentTurn === 'you';
    const sideLabel = game.you.side === 'hero' ? '◈ HEROES' : '⚠ VILLAINS';
    const sideColor = game.you.side === 'hero' ? 'var(--j-blue)' : '#a855f7';

    return `
    <div class="page" id="page-game">

        <!-- TOP BAR -->
        <div class="game-topbar">
            <div class="game-topbar-info">TURN <b>${game.turnNumber}</b></div>
            <div class="game-topbar-sep"></div>
            <div class="game-topbar-info ${isMyTurn ? '' : 'threat'}">
                ${isMyTurn ? 'YOUR TURN' : 'OPPONENT TURN'}
            </div>
            <div class="game-topbar-sep"></div>
            <div class="game-topbar-info" style="color:${sideColor};font-size:9px;letter-spacing:2px;">
                ${sideLabel}
            </div>
            <div class="game-topbar-sep"></div>
            <div class="game-topbar-info" style="color:var(--j-blue);font-size:9px;">
                ◈ J.A.R.V.I.S. TACTICAL SUPPORT ACTIVE
            </div>
            <div class="game-topbar-right">
                <div class="game-timer">
                    <div class="timer-ring"><span id="game-timer-val">30</span></div>
                    <div class="timer-label">SEC</div>
                </div>
            </div>
        </div>

        <!-- FIELD -->
        <div class="game-field">

            <!-- OPPONENT ZONE -->
            <div class="zone-opponent">
                ${_renderCombatant(game.opponent, 'threat')}
                <div class="board-slots" id="board-opponent">
                    ${_renderOpponentBoard(game.opponent.field)}
                </div>
                <div class="opp-hand-wrap">
                    ${Array.from({ length: game.opponent.handCount || 0 })
                        .map(() => `<div class="opp-hand-card">◈</div>`).join('')}
                    ${game.opponent.reserveCard
                        ? `<div class="opp-reserve-badge" title="Opponent has a reserve card">⚠ RESERVE</div>`
                        : ''}
                </div>
            </div>

            <!-- CENTER DIVIDER -->
            <div class="game-center">
                <div class="game-center-line"></div>
                <div class="game-center-text">◈ active simulation field ◈</div>
                <div class="game-center-line"></div>
            </div>

            <!-- PLAYER ZONE -->
            <div class="zone-player">
                ${_renderCombatant(game.you, 'cmd')}
                <div class="board-slots" id="board-player">
                    ${_renderPlayerBoard(game.you.field)}
                </div>

                <!-- Reserve card notification -->
                <div id="reserve-wrap">
                    ${_renderReserveCard(game.you.reserveCard, isMyTurn)}
                </div>

                <div class="hand-wrap">
                    <div class="hand-label">Combat Hand (${game.you.hand.length})</div>
                    <div class="hand-cards" id="hand-cards">
                        ${_renderHand(game.you.hand)}
                    </div>
                </div>
            </div>

        </div>

        <!-- BOTTOM ACTIONS -->
        <div class="game-actions">
            <div class="game-action-info" id="action-hint">
                Select a card to deploy or attack
            </div>
            <button class="btn-surrender" id="btn-surrender">Abort Sim</button>
            <div class="game-jarvis" id="game-jarvis">Analyzing...</div>
            <button class="btn-end-turn" id="btn-end-turn" ${!isMyTurn ? 'disabled' : ''}>
                END TURN
            </button>
        </div>

    </div>
    `;
}

function _renderCombatant(player, side) {
    const maxHp = 20;
    const hpPct = Math.max(0, Math.round((player.hp / maxHp) * 100));
    const initials = (player.username || '??').slice(0, 2).toUpperCase();
    const sideStr  = side === 'threat' ? 'threat-hi' : 'j-blue';

    return `
    <div class="combatant">
        <div class="combatant-avatar ${side}-av" id="avatar-${side}">${initials}</div>
        <div class="combatant-name">${player.username || 'Commander'}</div>
        <div class="hp-bar-wrap">
            <div class="hp-label">
                <span>HP</span>
                <b style="color:var(--${sideStr})">${player.hp}/20</b>
            </div>
            <div class="hp-bar-track">
                <div class="hp-bar-fill ${side}-hp" style="width:${hpPct}%"></div>
            </div>
        </div>
    </div>`;
}

function _renderReserveCard(card, isMyTurn) {
    if (!card) return '';
    return `
    <div class="reserve-card-wrap" id="reserve-card-section">
        <div class="reserve-label">⚠ NEW UNIT AVAILABLE IN RESERVE</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div class="hcard reserve-hcard" style="pointer-events:none;">
                <div class="hcard-inner">
                    <div class="hcard-top" style="background:var(--gold);"></div>
                    <div class="hcard-cost-badge">${card.cost}</div>
                    <div class="hcard-name">${card.name}</div>
                    <div class="hcard-art">
                        <div class="hcard-art-bg ${card.art}"></div>
                        <div class="hcard-art-sym">${card.sym}</div>
                    </div>
                    <div class="hcard-stats">
                        <div class="hstat atk">${card.atk}</div>
                        <div class="hstat def">${card.def}</div>
                    </div>
                </div>
            </div>
            <div>
                <div style="font-family:var(--F-mono);font-size:10px;color:var(--text-dim);letter-spacing:1.5px;margin-bottom:8px;">
                    Taking this card ends your turn.
                </div>
                <button class="btn-take-reserve" id="btn-take-reserve" ${!isMyTurn ? 'disabled' : ''}>
                    ⬆ TAKE TO HAND
                </button>
            </div>
        </div>
    </div>`;
}

function _renderHand(cards = []) {
    if (!cards.length) return '<div style="font-family:var(--F-mono);font-size:10px;color:var(--text-dim);opacity:0.5;padding:10px;">No cards in hand</div>';
    return cards.map((card, idx) => `
        <div class="hcard" data-hand-idx="${idx}" data-instance="${card.instanceId}">
            <div class="hcard-inner">
                <div class="hcard-top" style="background:${window.gameState.game?.you.side==='villain'?'#a855f7':'var(--j-blue)'};"></div>
                <div class="hcard-cost-badge">${card.cost}</div>
                <div class="hcard-name">${card.name}</div>
                <div class="hcard-art">
                    <div class="hcard-art-bg ${card.art}"></div>
                    <div class="hcard-art-sym">${card.sym}</div>
                </div>
                <div class="hcard-stats">
                    <div class="hstat atk">${card.atk}</div>
                    <div class="hstat def">${card.def}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function _renderPlayerBoard(field = [null, null, null]) {
    return field.map((card, idx) => {
        if (!card) return `
            <div class="board-slot" data-player-slot="${idx}">
                <div class="board-slot-label">deploy unit</div>
            </div>`;
        return `
        <div class="board-slot" data-player-slot="${idx}">
            ${_buildBoardCard(card, 'cmd', idx)}
        </div>`;
    }).join('');
}

function _renderOpponentBoard(field = [null, null, null]) {
    return field.map((card, idx) => {
        if (!card) return `<div class="board-slot" data-opp-slot="${idx}"></div>`;
        return `
        <div class="board-slot" data-opp-slot="${idx}">
            ${_buildBoardCard(card, 'threat', idx)}
        </div>`;
    }).join('');
}

function _buildBoardCard(card, side, slotIdx) {
    const hpPct    = Math.max(0, Math.round(((card.currentHp || card.hp) / card.hp) * 100));
    const hpColor  = hpPct > 50 ? '#38b040' : hpPct > 25 ? '#e8a020' : '#e03020';

    return `
    <div class="bcard ${side}-card" data-slot="${slotIdx}" data-side="${side}">
        <div class="bcard-inner">
            <div class="bcard-top-bar"></div>
            <div class="bcard-cost">${card.cost}</div>
            <div class="bcard-name">${card.name}</div>
            <div class="bcard-alias">${card.alias || ''}</div>
            <div class="bcard-art">
                <div class="bcard-art-bg ${card.art}"></div>
                <div class="bcard-art-symbol">${card.sym}</div>
            </div>
            <!-- HP bar -->
            <div class="bcard-hp-bar-wrap">
                <div class="bcard-hp-bar-fill" style="width:${hpPct}%;background:${hpColor};"></div>
            </div>
            <div class="bcard-hp-text">${card.currentHp || card.hp}/${card.hp}</div>
            <div class="bcard-divider"></div>
            <div class="bcard-stats">
                <div class="bstat atk"><span class="bstat-icon">ATK</span> ${card.atk}</div>
                <div class="bstat def"><span class="bstat-icon">DEF</span> ${card.def}</div>
            </div>
        </div>
    </div>`;
}

function _setActionState(isMyTurn) {
    const endBtn = document.getElementById('btn-end-turn');
    if (endBtn) {
        endBtn.disabled = !isMyTurn || !pendingAttack;
        endBtn.textContent = pendingAttack ? '⚔ ATTACK!' : 'END TURN';
        endBtn.style.background = pendingAttack ? 'var(--threat)' : '';
    }

    const hint = document.getElementById('action-hint');
    if (hint) {
        if (!isMyTurn) {
            hint.innerHTML = 'Waiting for opponent...';
        } else if (pendingAttack) {
            const attCard = window.gameState.game?.you.field[pendingAttack.attackerSlot];
            const name = attCard ? attCard.name : '?';
            hint.innerHTML = `<span style="color:var(--threat);">⚔ ${name}</span> ready — press <b>ATTACK!</b> to confirm`;
        } else {
            hint.innerHTML = 'Deploy a card from hand <span style="color:var(--text-dim);">(auto-ends turn)</span> or select a field unit to attack';
        }
    }
}

function _attachSocketListeners() {
    window.appSocket.off('gameStateUpdate');
    window.appSocket.off('gameOver');
    window.appSocket.off('opponentAttack');

    window.appSocket.on('gameStateUpdate', ({ game }) => {
        window.gameState.game = game;
        _rerender();
    });

    window.appSocket.on('gameOver', ({ winner }) => {
        _clearTimer();
        if (_jarvisInterval) { clearInterval(_jarvisInterval); _jarvisInterval = null; }
        _showGameOver(winner === 'you');
    });

    window.appSocket.on('opponentAttack', ({ attackerSlot, targetSlot, attackerName }) => {
        _animateOpponentAttack(attackerSlot, targetSlot, attackerName);
    });

    _attachClickHandlers();
}

function _attachClickHandlers() {
    // Hand cards
    const handEl = document.getElementById('hand-cards');
    if (handEl) {
        handEl.addEventListener('click', e => {
            const hcard = e.target.closest('.hcard');
            if (!hcard || hcard.classList.contains('disabled')) return;
            const game = window.gameState.game;
            if (game.currentTurn !== 'you') return;
            const idx  = parseInt(hcard.dataset.handIdx);
            const card = game.you.hand[idx];
            if (!card) return;
            _selectCard('hand', idx, card);
        });
    }

    const boardPlayer = document.getElementById('board-player');
    if (boardPlayer) {
        boardPlayer.addEventListener('click', e => {
            const game = window.gameState.game;
            if (game.currentTurn !== 'you') return;
            const bcard = e.target.closest('.bcard');
            const slot  = e.target.closest('.board-slot');

            if (bcard && bcard.dataset.side === 'cmd') {
                const slotIdx = parseInt(bcard.dataset.slot);
                const card    = game.you.field[slotIdx];
                if (card) _selectCard('board', slotIdx, card);
                return;
            }

            if (slot && selectedCard?.type === 'hand') {
                const slotIdx = parseInt(slot.dataset.playerSlot);
                if (game.you.field[slotIdx] !== null) return;
                _playCard(selectedCard.index, slotIdx);
            }
        });
    }

    const boardOpp = document.getElementById('board-opponent');
    if (boardOpp) {
        boardOpp.addEventListener('click', e => {
            const game = window.gameState.game;
            if (game.currentTurn !== 'you') return;
            if (!selectedCard || selectedCard.type !== 'board') return;
            const bcard = e.target.closest('.bcard');
            if (bcard && bcard.dataset.side === 'threat') {
                _setPendingAttack(selectedCard.index, parseInt(bcard.dataset.slot));
            }
        });
    }

    const avatarThreat = document.getElementById('avatar-threat');
    if (avatarThreat) {
        avatarThreat.addEventListener('click', () => {
            const game = window.gameState.game;
            if (game.currentTurn !== 'you') return;
            if (!selectedCard || selectedCard.type !== 'board') return;
            if (game.opponent.field.some(Boolean)) {
                _setHint('Cannot attack directly while enemy units are on the field.');
                return;
            }
            _setPendingAttack(selectedCard.index, -1);
        });
    }

    const endBtn = document.getElementById('btn-end-turn');
    if (endBtn) {
        endBtn.addEventListener('click', () => {
            if (!pendingAttack) return;
            const atk = { ...pendingAttack };
            _clearSelection();
            window.appSocket.emit('attack', atk);
            _setActionState(false);
        });
    }

    const takeReserveBtn = document.getElementById('btn-take-reserve');
    if (takeReserveBtn) {
        takeReserveBtn.addEventListener('click', () => {
            _clearSelection();
            window.appSocket.emit('takeReserve', {});
            _setActionState(false);
        });
    }

    const surrenderBtn = document.getElementById('btn-surrender');
    if (surrenderBtn) {
        surrenderBtn.addEventListener('click', () => {
            if (confirm('Abort simulation? This counts as a loss.')) {
                window.appSocket.emit('surrender', {});
            }
        });
    }
}

function _selectCard(type, index, card) {
    _clearSelection();
    selectedCard  = { type, index, card };
    pendingAttack = null;

    if (type === 'hand') {
        const el = document.querySelector(`[data-hand-idx="${index}"]`);
        if (el) el.classList.add('selected');
        _highlightPlayerSlots(true);
        _setHint(`<span>${card.name}</span> selected — click an empty deploy slot`);
    } else {
        const el = document.querySelector(`#board-player [data-slot="${index}"]`);
        if (el) el.classList.add('selected');
        _highlightEnemyTargets(true);
        _setHint(`<span>${card.name}</span> selected — click an enemy unit to set target`);
    }
}

function _clearSelection() {
    selectedCard  = null;
    pendingAttack = null;
    document.querySelectorAll('.hcard.selected').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.bcard.selected').forEach(el => el.classList.remove('selected'));
    _highlightPlayerSlots(false);
    _highlightEnemyTargets(false);
    _setActionState(window.gameState.game?.currentTurn === 'you');
}

function _setPendingAttack(attackerSlot, targetSlot) {
    pendingAttack = { attackerSlot, targetSlot };
    if (targetSlot !== -1) {
        document.querySelectorAll('#board-opponent .bcard').forEach((el, i) => {
            el.classList.toggle('attack-target', i === targetSlot);
        });
    }
    _setActionState(true);
}

function _highlightPlayerSlots(on) {
    const field = window.gameState.game?.you.field || [];
    document.querySelectorAll('#board-player .board-slot').forEach((slot, idx) => {
        if (on && field[idx] === null) slot.classList.add('highlight-drop');
        else slot.classList.remove('highlight-drop');
    });
}

function _highlightEnemyTargets(on) {
    document.querySelectorAll('#board-opponent .bcard').forEach(el => {
        el.classList.toggle('targetable', on);
    });
    const avatar = document.getElementById('avatar-threat');
    const hasEnemyCards = window.gameState.game?.opponent.field.some(Boolean);
    if (avatar) avatar.classList.toggle('targetable', on && !hasEnemyCards);
}

function _playCard(handIndex, slotIndex) {
    const card = window.gameState.game.you.hand[handIndex];
    if (!card) return;
    _clearSelection();
    window.appSocket.emit('playCard', { cardId: card.id, instanceId: card.instanceId, slotIndex });
}

function _setHint(html) {
    const el = document.getElementById('action-hint');
    if (el) el.innerHTML = html;
}

function _rerender() {
    const game = window.gameState.game;
    if (!game) return;

    document.querySelectorAll('.hp-label b').forEach(el => {
        const wrap = el.closest('.combatant');
        if (!wrap) return;
        const side = wrap.querySelector('.threat-av') ? 'threat' : 'cmd';
        const hp   = side === 'threat' ? game.opponent.hp : game.you.hp;
        el.textContent = hp + '/20';
        const bar = wrap.querySelector('.hp-bar-fill');
        if (bar) bar.style.width = Math.max(0, Math.round((hp / 20) * 100)) + '%';
    });

    const bp = document.getElementById('board-player');
    const bo = document.getElementById('board-opponent');
    const hc = document.getElementById('hand-cards');
    const rw = document.getElementById('reserve-wrap');
    const oh = document.querySelector('.opp-hand-wrap');

    if (bp) bp.innerHTML = _renderPlayerBoard(game.you.field);
    if (bo) bo.innerHTML = _renderOpponentBoard(game.opponent.field);
    if (hc) hc.innerHTML = _renderHand(game.you.hand);
    if (rw) rw.innerHTML = _renderReserveCard(game.you.reserveCard, game.currentTurn === 'you');
    if (oh) {
        oh.innerHTML = Array.from({ length: game.opponent.handCount || 0 })
            .map(() => `<div class="opp-hand-card">◈</div>`).join('')
            + (game.opponent.reserveCard
                ? `<div class="opp-reserve-badge">⚠ RESERVE</div>` : '');
    }

    const topInfo = document.querySelector('.game-topbar-info:nth-child(3)');
    const isMyTurn = game.currentTurn === 'you';
    if (topInfo) {
        topInfo.textContent = isMyTurn ? 'YOUR TURN' : 'OPPONENT TURN';
        topInfo.className = 'game-topbar-info' + (isMyTurn ? '' : ' threat');
    }

    const tn = document.querySelector('.game-topbar-info b');
    if (tn) tn.textContent = game.turnNumber;

    if (isMyTurn) _startTimer(game.turnTimeLeft || 30);
    else _clearTimer();

    _setActionState(isMyTurn);
    _reattachClickHandlers();
}

function _reattachClickHandlers() {
    const game = window.gameState.game;
    if (!game) return;

    const handEl = document.getElementById('hand-cards');
    if (handEl) {
        const newHand = handEl.cloneNode(true);
        handEl.replaceWith(newHand);
        newHand.addEventListener('click', e => {
            if (game.currentTurn !== 'you') return;
            const hcard = e.target.closest('.hcard');
            if (!hcard) return;
            const idx  = parseInt(hcard.dataset.handIdx);
            const card = game.you.hand[idx];
            if (card) _selectCard('hand', idx, card);
        });
    }

    const boardEl = document.getElementById('board-player');
    if (boardEl) {
        const newBoard = boardEl.cloneNode(true);
        boardEl.replaceWith(newBoard);
        newBoard.addEventListener('click', e => {
            if (game.currentTurn !== 'you') return;
            const bcard = e.target.closest('.bcard');
            const slot  = e.target.closest('.board-slot');
            if (bcard && bcard.dataset.side === 'cmd') {
                const slotIdx = parseInt(bcard.dataset.slot);
                const card    = game.you.field[slotIdx];
                if (card) _selectCard('board', slotIdx, card);
                return;
            }
            if (slot && selectedCard?.type === 'hand') {
                const slotIdx = parseInt(slot.dataset.playerSlot);
                if (game.you.field[slotIdx] !== null) return;
                _playCard(selectedCard.index, slotIdx);
            }
        });
    }

    const oppEl = document.getElementById('board-opponent');
    if (oppEl) {
        const newOpp = oppEl.cloneNode(true);
        oppEl.replaceWith(newOpp);
        newOpp.addEventListener('click', e => {
            if (game.currentTurn !== 'you') return;
            if (!selectedCard || selectedCard.type !== 'board') return;
            const bcard = e.target.closest('.bcard');
            if (bcard && bcard.dataset.side === 'threat') {
                _setPendingAttack(selectedCard.index, parseInt(bcard.dataset.slot));
            }
        });
    }

    const takeBtn = document.getElementById('btn-take-reserve');
    if (takeBtn) {
        const newTake = takeBtn.cloneNode(true);
        takeBtn.replaceWith(newTake);
        newTake.addEventListener('click', () => {
            _clearSelection();
            window.appSocket.emit('takeReserve', {});
            _setActionState(false);
        });
    }

    const endBtn = document.getElementById('btn-end-turn');
    if (endBtn) {
        const newEnd = endBtn.cloneNode(true);
        endBtn.replaceWith(newEnd);
        newEnd.addEventListener('click', () => {
            if (!pendingAttack) return;
            const atk = { ...pendingAttack };
            _clearSelection();
            window.appSocket.emit('attack', atk);
            _setActionState(false);
        });
    }

    const avatar = document.getElementById('avatar-threat');
    if (avatar) {
        const newAv = avatar.cloneNode(true);
        avatar.replaceWith(newAv);
        newAv.addEventListener('click', () => {
            if (game.currentTurn !== 'you') return;
            if (!selectedCard || selectedCard.type !== 'board') return;
            if (game.opponent.field.some(Boolean)) {
                _setHint('Cannot attack directly while enemy units are on the field.');
                return;
            }
            _setPendingAttack(selectedCard.index, -1);
        });
    }
}

function _animateOpponentAttack(attackerSlot, targetSlot, attackerName) {
    const attackerEl = document.querySelector(
        `#board-opponent [data-slot="${attackerSlot}"].threat-card`
    );

    const targetEl = targetSlot !== -1
        ? document.querySelector(`#board-player [data-slot="${targetSlot}"].cmd-card`)
        : document.getElementById('avatar-cmd');

    if (!attackerEl || !targetEl) return;

    attackerEl.classList.add('opp-attacking');
    _setHint(`<span style="color:#ff4040;">⚠ ${attackerName || 'Enemy unit'}</span> is attacking!`);

    const attackerRect = attackerEl.getBoundingClientRect();
    const targetRect   = targetEl.getBoundingClientRect();

    const startX = attackerRect.left + attackerRect.width / 2;
    const startY = attackerRect.top + attackerRect.height / 2;
    const endX   = targetRect.left + targetRect.width / 2;
    const endY   = targetRect.top + targetRect.height / 2;

    const comet = document.createElement('div');
    comet.className = 'attack-comet';

    const head = document.createElement('div');
    head.className = 'attack-comet-head';

    const tail = document.createElement('div');
    tail.className = 'attack-comet-tail';

    const segments = ['seg-1', 'seg-2', 'seg-3', 'seg-4'].map(cls => {
        const el = document.createElement('div');
        el.className = `comet-segment ${cls}`;
        tail.appendChild(el);
        return el;
    });

    comet.appendChild(tail);
    comet.appendChild(head);
    document.body.appendChild(comet);

    const duration = 1100;
    const started = performance.now();
    const history = [];
    const historyMax = 18;

    function easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function spawnExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'attack-explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top  = `${y}px`;

        const core = document.createElement('div');
        core.className = 'attack-explosion-core';

        const ring = document.createElement('div');
        ring.className = 'attack-explosion-ring';

        const glow = document.createElement('div');
        glow.className = 'attack-explosion-glow';

        explosion.appendChild(glow);
        explosion.appendChild(ring);
        explosion.appendChild(core);

        const count = 10;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'attack-particle';

            const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.35);
            const dist = 28 + Math.random() * 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;

            p.style.setProperty('--dx', `${dx}px`);
            p.style.setProperty('--dy', `${dy}px`);
            p.style.left = '0px';
            p.style.top = '0px';
            p.style.transform = 'translate(-50%, -50%)';

            p.animate(
                [
                    { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`, opacity: 0 }
                ],
                { duration: 560, easing: 'cubic-bezier(0.15, 0.85, 0.2, 1)', fill: 'forwards' }
            );

            explosion.appendChild(p);
        }

        document.body.appendChild(explosion);
        targetEl.classList.add('attack-hit-flash');

        setTimeout(() => {
            explosion.remove();
            targetEl.classList.remove('attack-hit-flash');
        }, 650);
    }

    function step(now) {
        const t = Math.min((now - started) / duration, 1);
        const eased = easeInOutCubic(t);

        const x = startX + (endX - startX) * eased;
        const y = startY + (endY - startY) * eased;

        history.unshift({ x, y });
        if (history.length > historyMax) history.pop();

        comet.style.left = `${x}px`;
        comet.style.top  = `${y}px`;

        const velocityX = history.length > 1 ? history[0].x - history[1].x : endX - startX;
        const velocityY = history.length > 1 ? history[0].y - history[1].y : endY - startY;
        const angle = Math.atan2(velocityY, velocityX) * 180 / Math.PI;
        const tailAngle = angle + 180;

        const tailSources = history.slice(2, 6);
        segments.forEach((seg, i) => {
            const src = tailSources[i] || history[history.length - 1] || { x, y };
            const fade = 1 - i * 0.2;
            const dx = src.x - x;
            const dy = src.y - y;

            seg.style.left = `${dx}px`;
            seg.style.top  = `${dy}px`;
            seg.style.opacity = String(Math.max(0, fade));
            seg.style.transform = `translate(-50%, -50%) rotate(${tailAngle}deg) scale(${1 - i * 0.12})`;
        });

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            spawnExplosion(endX, endY);
            comet.remove();
            setTimeout(() => attackerEl.classList.remove('opp-attacking'), 120);
        }
    }

    requestAnimationFrame(step);
}

function _shootProjectile(fromEl, toEl) {
    const fromR = fromEl.getBoundingClientRect();
    const toR = toEl.getBoundingClientRect();

    const x1 = fromR.left + fromR.width  / 2;
    const y1 = fromR.top  + fromR.height / 2;
    const x2 = toR.left   + toR.width    / 2;
    const y2 = toR.top    + toR.height   / 2;

    // SVG beam line
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
        position:fixed; inset:0; width:100%; height:100%;
        pointer-events:none; z-index:99; overflow:visible;
    `;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x1); line.setAttribute('y2', y1);
    line.setAttribute('stroke', '#e03020');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.style.filter = 'drop-shadow(0 0 6px #ff4020)';
    svg.appendChild(line);
    document.body.appendChild(svg);

    // Animate line extending toward target
    const start = performance.now();
    const dur   = 350;
    function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        line.setAttribute('x2', x1 + (x2 - x1) * ease);
        line.setAttribute('y2', y1 + (y2 - y1) * ease);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    // Impact spark
    setTimeout(() => {
        svg.remove();
        const spark = document.createElement('div');
        spark.className = 'attack-spark';
        spark.style.cssText = `left:${x2}px; top:${y2}px;`;
        spark.textContent = '💥';
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 500);
    }, dur + 20);
}

// ── Game over ────────────────────────────────────────────────────────────────

function _showGameOver(isWin) {
    const oldOverlay = document.querySelector('.gameover-overlay');
    if (oldOverlay) oldOverlay.remove();

    const overlay = document.createElement('div');
    overlay.className = 'gameover-overlay';
    overlay.innerHTML = `
        <div class="gameover-panel">
            <div class="corner tl"></div><div class="corner tr"></div>
            <div class="corner bl"></div><div class="corner br"></div>
            <div class="gameover-icon">${isWin ? '◈' : '⚠'}</div>
            <div class="gameover-title ${isWin ? 'win' : 'lose'}">
                ${isWin ? 'MISSION COMPLETE' : 'SIMULATION FAILED'}
            </div>
            <div class="gameover-sub">
                ${isWin ? 'Threat entity neutralized' : 'Threat containment unsuccessful'}
            </div>
            <button class="gameover-btn">RETURN TO OPS CENTER</button>
        </div>
    `;
    overlay.querySelector('.gameover-btn').addEventListener('click', () => {
        window.gameState.game = null;
        _clearTimer();
        if (_jarvisInterval) { clearInterval(_jarvisInterval); _jarvisInterval = null; }
        overlay.remove();
        window.appRouter.navigate('lobby');
    });
    document.body.appendChild(overlay);
}

window.appRouter.register('game', renderGamePage);