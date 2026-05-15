function renderMenuPage(container) {
    if (!window.gameState.token) {
        window.appRouter.navigate('login');
        return;
    }

    container.innerHTML = `
        <div class="page" id="page-menu" style="display:grid;grid-template-columns:290px 1fr;">

        <div class="menu-sidebar">
            <div class="commander-card">
            <div class="commander-avatar-wrap">
                <div class="commander-avatar-ring-2"></div>
                <div class="commander-avatar-ring"></div>
                <div class="commander-avatar" id="cmd-avatar">${window.gameState.username ? window.gameState.username.slice(0,2).toUpperCase() : '??'}</div>
            </div>
            <div>
                <div class="commander-name" id="cmd-name">${window.gameState.username || 'Commander'}</div>
            </div>
            <div class="commander-stats">
                <div class="cmd-stat">
                <div class="cmd-stat-val wins" id="cmd-wins">--</div>
                <div class="cmd-stat-key">Wins</div>
                </div>
                <div class="cmd-stat">
                <div class="cmd-stat-val losses" id="cmd-losses">--</div>
                <div class="cmd-stat-key">Lost</div>
                </div>
                <div class="cmd-stat">
                <div class="cmd-stat-val rate" id="cmd-rate">--%</div>
                <div class="cmd-stat-key">Rate</div>
                </div>
            </div>
            </div>

            <nav class="menu-nav">
            <div class="menu-btn" id="btn-deploy">
                <div class="menu-btn-icon">⚔</div>
                Deploy Simulation
            </div>
            <div class="menu-btn" id="btn-collection">
                <div class="menu-btn-icon">◈</div>
                Unit Registry
            </div>
            <div class="menu-btn" id="btn-leaderboard">
                <div class="menu-btn-icon"><i data-lucide="trophy"></i></div>
                Global Rankings
            </div>
            <div class="menu-btn" id="btn-config">
                <div class="menu-btn-icon">⚙</div>
                System Config
            </div>
            <div class="menu-btn" id="btn-logout" style="margin-top:auto;color:var(--text-dim);">
                <div class="menu-btn-icon">↩</div>
                Terminate Session
            </div>
            </nav>
        </div>

        <div class="menu-content">
            <div class="sim-log">
            <div class="sim-log-line">All systems operational. Strategic overview ready, Commander.</div>
            <div class="sim-log-line">Threat database synchronized. 30 combat units indexed and combat-ready.</div>
            <div class="sim-log-line" id="sim-winrate-msg">Your win rate will be displayed after data load.</div>
            </div>

            <div>
            <div class="section-head">RECENT <span>SIMULATIONS</span></div>
            <div class="matches-list" id="recent-matches-list"></div>
            </div>

            <div>
            <div class="section-head">GLOBAL <span>OPERATOR RANKINGS</span></div>
            <div class="leaderboard" id="leaderboard-container"></div>
            </div>
        </div>

        <!-- Searching overlay (matchmaking) -->
        <div id="match-searching">
            <div class="searching-panel">
                <div class="searching-vs">
                    <div class="searching-you">
                        <div class="vs-avatar-you" id="search-you-init">${window.gameState.username ? window.gameState.username.slice(0,2).toUpperCase() : 'HE'}</div>
                        <div class="vs-you-name">${window.gameState.username || 'You'}</div>
                    </div>
                    <div class="vs-text-center">VS</div>
                    <div class="searching-opp">
                        <div class="vs-avatar-opp">?</div>
                        <div class="vs-opp-name searching-dots">SEARCHING</div>
                    </div>
                </div>
                <div class="search-timer-wrap">
                    <div class="search-bar-track"><div class="search-bar-fill" id="search-bar"></div></div>
                    <div class="search-timer-label">MATCHMAKING · <span id="search-elapsed">00:00</span></div>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-cancel-search">Cancel</button>
            </div>
        </div>

        </div>

        <!-- BOTTOM-RIGHT Deploy button -->
        <button class="btn btn-primary" id="btn-deploy-main"
            style="position:fixed;bottom:28px;right:28px;z-index:99;margin:0;width:auto;padding:16px 52px;font-size:15px;letter-spacing:4px;box-shadow:0 0 32px rgba(0,120,255,0.4);">
            ⚔ DEPLOY
        </button>
    `;

    if (window.lucide) window.lucide.createIcons();

    _loadProfileAndPopulate();

    let searchInterval = null;
    let searchSeconds  = 0;

    const searchingOverlay = document.getElementById('match-searching');
    const btnDeploySidebar = document.getElementById('btn-deploy');
    const btnDeployMain = document.getElementById('btn-deploy-main');

    function _enableDeployButtons() {
        if (btnDeploySidebar) btnDeploySidebar.disabled = false;
        if (btnDeployMain) btnDeployMain.disabled = false;
    }

    function _disableDeployButtons() {
        if (btnDeploySidebar) btnDeploySidebar.disabled = true;
        if (btnDeployMain) btnDeployMain.disabled = true;
    }

    function _startSearch() {
        if (searchingOverlay.classList.contains('active')) return;

        searchingOverlay.classList.add('active');
        _disableDeployButtons();

        searchSeconds = 0;
        if (searchInterval) clearInterval(searchInterval);
        searchInterval = setInterval(() => {
            searchSeconds++;
            const s = String(searchSeconds % 60).padStart(2, '0');
            const m = String(Math.floor(searchSeconds / 60)).padStart(2, '0');
            const el = document.getElementById('search-elapsed');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);

        window.appSocket.emit('joinQueue', {
            userId: window.gameState.userId,
            username: window.gameState.username
        });
    }

    function _cancelSearch() {
        searchingOverlay.classList.remove('active');
        clearInterval(searchInterval);
        searchInterval = null;
        searchSeconds = 0;
        _enableDeployButtons();

        window.appSocket.emit('leaveQueue');
    }

    // Event listeners
    btnDeploySidebar.addEventListener('click', _startSearch);
    btnDeployMain.addEventListener('click', _startSearch);

    document.getElementById('btn-cancel-search').addEventListener('click', _cancelSearch);

    document.getElementById('btn-collection').addEventListener('click', () => {
        window.appRouter.navigate('collection');
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
        document.getElementById('leaderboard-container').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btn-config').addEventListener('click', () => {
        console.log('System Config not yet available.');
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        window.clearAuth();
        window.appRouter.navigate('login');
    });

    window.appSocket.on('preGame', ({ side, cards }) => {
        if (searchInterval) {
            clearInterval(searchInterval);
            searchInterval = null;
        }
        searchingOverlay.classList.remove('active');
        _enableDeployButtons();

        window.gameState.preGameData = { side, cards };
        window.appRouter.navigate('pregame');
    });

    window.appSocket.on('gameStart', (data) => {
        if (window.gameState.currentPage === 'lobby') {
            if (searchInterval) {
                clearInterval(searchInterval);
                searchInterval = null;
            }
            searchingOverlay.classList.remove('active');
            _enableDeployButtons();

            window.gameState.game = data;
            window.appRouter.navigate('game');
        }
    });

    async function _loadProfileAndPopulate() {
        try {
            const profile = await window.api.getProfile();
            window.gameState.userId = profile.userId;
            window.gameState.username = profile.username;
            window.gameState.avatar = profile.avatar;

            document.getElementById('cmd-avatar').textContent = profile.username.slice(0, 2).toUpperCase();
            document.getElementById('cmd-name').textContent = profile.username.toUpperCase();
            document.getElementById('cmd-wins').textContent = profile.wins || 0;
            document.getElementById('cmd-losses').textContent = profile.losses || 0;
            const rate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
            document.getElementById('cmd-rate').textContent = rate + '%';

            const winMsgEl = document.getElementById('sim-winrate-msg');
            if (winMsgEl) {
                winMsgEl.textContent = rate >= 50
                    ? 'Your win rate is above average today. Tactical advantage confirmed.'
                    : 'Keep training, Commander. Success requires sacrifice.';
            }

            const recentMatches = await window.api.getRecentMatches();
            _renderRecentMatches(recentMatches);

            const leaderboard = await window.api.getLeaderboard();
            _renderLeaderboard(leaderboard, profile.userId);
        } catch (err) {
            console.error('[Menu] Failed to load profile data:', err);
        }
    }

    function _renderRecentMatches(matches = []) {
        const c = document.getElementById('recent-matches-list');
        if (!c) return;
        if (!matches.length) {
            c.innerHTML = '<div class="match-row" style="justify-content:center;opacity:0.6;">No recent simulations</div>';
            return;
        }
        c.innerHTML = matches.map(m => {
            const winClass = m.result === 'win' ? 'win' : 'loss';
            return `
            <div class="match-row ${winClass}">
                <div class="match-result">${m.result === 'win' ? 'WIN' : 'FAIL'}</div>
                <div>
                    <div class="match-opponent">${m.opponent}</div>
                    <div class="match-opponent-label">${m.opponentClearance || 'Standard'}</div>
                </div>
                <div class="match-info"><b>${m.unitsDeployed || '?'}</b> units deployed</div>
                <div class="match-info"><b>${m.turns || '?'}</b> turns</div>
                <div class="match-time">${m.timeAgo || 'recently'}</div>
            </div>`;
        }).join('');
    }

    function _renderLeaderboard(entries = [], currentUserId) {
        const c = document.getElementById('leaderboard-container');
        if (!c) return;
        if (!entries.length) {
            c.innerHTML = '<div style="opacity:0.6; text-align:center; padding:20px;">Leaderboard data unavailable</div>';
            return;
        }
        let html = `<div class="lb-header"><span>#</span><span>Operator</span><span>Wins</span><span>Lost</span><span>Win %</span></div>`;
        entries.forEach(entry => {
            const isYou = entry.userId === currentUserId;
            const rankClass = entry.rank <= 3 ? ['gold','silver','bronze'][entry.rank-1] : '';
            html += `
            <div class="lb-row${isYou ? ' you' : ''}">
                <div class="lb-rank ${rankClass}">${entry.rank}</div>
                <div class="lb-name${isYou ? ' you-name' : ''}">${entry.username}${isYou ? ' ◀ YOU' : ''}</div>
                <div class="lb-val wins">${entry.wins}</div>
                <div class="lb-val losses">${entry.losses}</div>
                <div class="lb-val rate">${entry.winRate}%</div>
            </div>`;
        });
        c.innerHTML = html;
    }
}

window.appRouter.register('lobby', renderMenuPage);