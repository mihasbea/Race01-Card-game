function renderPreGamePage(container) {
    const pg = window.gameState.preGameData;
    if (!pg || !pg.cards) {
        console.warn('[PreGame] No data, redirect to lobby');
        window.appRouter.navigate('lobby');
        return;
    }
    const { side, cards } = pg;
    const sideLabel = side === 'hero' ? '◈ HEROES' : '⚠ VILLAINS';
    const sideColor = side === 'hero' ? 'var(--j-blue)' : 'var(--threat)';
    let selectedIds = [];

    container.innerHTML = `
        <div class="page" id="page-pregame">
            <div class="pregame-panel">
                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>

                <div class="pregame-side-badge" style="color:${sideColor}">${sideLabel}</div>
                <div class="pregame-title">DEPLOY FIELD UNITS</div>
                <div class="pregame-instruction">
                    SELECT 3 CARDS FOR YOUR STARTING LINEUP<br>
                    <span>4 WILL REMAIN IN RESERVE</span>
                </div>

                <div class="pregame-grid" id="pregame-grid"></div>

                <div class="pregame-footer">
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
                <div class="pregame-card ${isSelected ? 'selected' : ''}"
                        data-iid="${card.instanceId}"
                        style="--side-color: ${sideColor}">
                    <div class="pregame-card-inner">
                        <div class="pregame-card-top"></div>
                        <div class="pregame-card-cost">${card.cost}</div>
                        <div class="pregame-card-name">${card.name}</div>
                        <div class="pregame-card-alias">${card.alias || ''}</div>
                        <div class="pregame-card-art">
                            <div class="pregame-card-art-bg ${card.art}"></div>
                            <div class="pregame-card-art-sym">${card.sym}</div>
                        </div>
                        <div class="pregame-card-stats">
                            <div class="pregame-stat atk">
                                <span>ATK</span> ${card.atk}
                            </div>
                            <div class="pregame-stat def">
                                <span>DEF</span> ${card.def}
                            </div>
                        </div>
                        <div class="pregame-card-hp">HP ${card.hp} · COST ${card.cost}</div>
                        ${isSelected ? '<div class="pregame-card-check">✓</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.pregame-card').forEach(el => {
            el.addEventListener('click', () => {
                const iid = el.dataset.iid;
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
        });
    }

    renderCards();

    confirmBtn.addEventListener('click', () => {
        if (selectedIds.length !== 3) return;
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.4';
        confirmBtn.textContent = 'WAITING FOR OPPONENT...';
        statusEl.textContent = 'Sending selection to server...';
        console.log('[PreGame] Emitting selectCards', selectedIds);
        window.appSocket.emit('selectCards', { selectedIds });
    });

    function onGameStart(data) {
        console.log('[PreGame] gameStart received', data);
        window.gameState.game = data;
        window.appSocket.off('gameStart', onGameStart);
        window.appRouter.navigate('game');
    }
    window.appSocket.on('gameStart', onGameStart);

    function onSelectionConfirmed({ waiting }) {
        console.log('[PreGame] selectionConfirmed, waiting:', waiting);
        if (waiting) {
            statusEl.textContent = 'Selection locked. Waiting for opponent…';
        } else {
            statusEl.textContent = 'Opponent ready! Starting simulation…';
        }
    }
    window.appSocket.on('selectionConfirmed', onSelectionConfirmed);

    window.addEventListener('hashchange', function cleanup() {
        window.appSocket.off('gameStart', onGameStart);
        window.appSocket.off('selectionConfirmed', onSelectionConfirmed);
        window.removeEventListener('hashchange', cleanup);
    });
}

window.appRouter.register('pregame', renderPreGamePage);