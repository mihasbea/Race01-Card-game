function renderPreGamePage(container) {
    const pg = window.gameState.preGameData;
    if (!pg || !pg.cards) {
        console.warn('[PreGame] No data, redirect to lobby');
        window.appRouter.navigate('lobby');
        return;
    }
    const { side, cards } = pg;
    const sideLabel = side === 'hero' ? '◈ HEROES' : '⚠ VILLAINS';
    const sideColor = side === 'hero' ? 'var(--j-blue)' : '#a855f7';
    let selectedIds = [];

    container.innerHTML = `
        <div class="page" id="page-pregame">
            <div class="pregame-panel ${side === 'hero' ? 'pg-hero' : 'pg-villain'}">
                <div class="pregame-side-badge" style="color:${sideColor}">${sideLabel}</div>
                <div class="pregame-title">DEPLOY FIELD UNITS</div>
                <div class="pregame-instruction">
                    SELECT 3 CARDS FOR YOUR STARTING LINEUP<br>
                    <span>4 WILL REMAIN IN RESERVE</span>
                </div>

                <div class="pregame-grid" id="pregame-grid"></div>

                <div class="pregame-footer">
                    <button class="pregame-cancel" id="pregame-cancel">
                        ← LOBBY
                    </button>
                    <div class="pregame-counter" id="pregame-counter">0 / 3 SELECTED</div>
                    <button class="btn-primary pregame-confirm" id="pregame-confirm" disabled>
                        CONFIRM SELECTION
                    </button>
                    <div class="pregame-status" id="pregame-status"></div>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('pregame-grid');
    const counter = document.getElementById('pregame-counter');
    const confirmBtn = document.getElementById('pregame-confirm');
    const statusEl = document.getElementById('pregame-status');

    function renderCards() {
        grid.innerHTML = cards.map(card => {
            const isSelected = selectedIds.includes(card.instanceId);
            return `
                <div class="pregame-card hcard ${isSelected ? 'selected' : ''}" data-iid="${card.instanceId}">
                    <div class="hcard-inner">
                        <div class="hcard-top" style="background:${sideColor};"></div>
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
            `;
        }).join('');
    }

    grid.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.pregame-card');
        if (!cardEl) return;

        const iid = cardEl.dataset.iid;
        if (selectedIds.includes(iid)) {
            selectedIds = selectedIds.filter(x => x !== iid);
        } else {
            if (selectedIds.length >= 3) return;
            selectedIds.push(iid);
        }

        renderCards();
        
        counter.textContent = `${selectedIds.length} / 3 SELECTED`;
        const ready = selectedIds.length === 3;
        confirmBtn.disabled = !ready;
        confirmBtn.style.opacity = ready ? '1' : '0.4';
    });

    renderCards();

    function cleanupAllListeners() {
        console.log('[PreGame] Cleaning up socket listeners');
        window.appSocket.off('gameStart', onGameStart);
        window.appSocket.off('selectionConfirmed', onSelectionConfirmed);
        window.appSocket.off('pregameCancelled', onPregameCancelled);
    }

    function onPregameCancelled() {
        console.log('[PreGame] Triggering onPregameCancelled');
        alert('Your opponent has left the game setup.');
        cleanupAllListeners();
        window.appRouter.navigate('lobby');
    }

    function onGameStart(data) {
        console.log('[PreGame] gameStart received', data);
        window.gameState.game = data;
        cleanupAllListeners();
        window.appRouter.navigate('game');
    }

    function onSelectionConfirmed({ waiting }) {
        console.log('[PreGame] selectionConfirmed, waiting:', waiting);
        if (waiting) {
            statusEl.textContent = 'Selection locked. Waiting for opponent…';
        } else {
            statusEl.textContent = 'Opponent ready! Starting simulation…';
        }
    }

    window.appSocket.on('pregameCancelled', onPregameCancelled);
    window.appSocket.on('gameStart', onGameStart);
    window.appSocket.on('selectionConfirmed', onSelectionConfirmed);

    document.getElementById('pregame-cancel').addEventListener('click', () => {
        const btn = document.getElementById('pregame-cancel');
        if (btn.dataset.confirming) {
            cleanupAllListeners();
            window.appSocket.emit('cancelPregame');
            window.appRouter.navigate('lobby');
        } else {
            btn.dataset.confirming = '1';
            btn.textContent = 'CONFIRM LEAVE?';
            btn.classList.add('confirming');
            setTimeout(() => {
                if (btn.dataset.confirming) {
                    delete btn.dataset.confirming;
                    btn.textContent = '← LOBBY';
                    btn.classList.remove('confirming');
                }
            }, 3000);
        }
    });

    confirmBtn.addEventListener('click', () => {
        if (selectedIds.length !== 3) return;
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.4';
        confirmBtn.textContent = 'WAITING FOR OPPONENT...';
        statusEl.textContent = 'Sending selection to server...';
        console.log('[PreGame] Emitting selectCards', selectedIds);
        window.appSocket.emit('selectCards', { selectedIds });
    });

    window.addEventListener('hashchange', function cleanup() {
        cleanupAllListeners();
        window.removeEventListener('hashchange', cleanup);
    });
}

window.appRouter.register('pregame', renderPreGamePage);