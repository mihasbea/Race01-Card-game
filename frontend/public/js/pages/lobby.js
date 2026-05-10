// js/pages/menu.js

function renderMenuPage(container) {
    // Guard: redirect to login if no token
    if (!window.gameState.token) {
        window.appRouter.navigate('login');
        return;
    }

    // Layout with dynamic placeholders
    // All static texts are kept, data-driven fields use template literals
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
            <div class="menu-btn featured" id="btn-deploy">
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
            <div class="sim-log-line">Threat database synchronized. 20 combat units indexed and combat-ready.</div>
            <div class="sim-log-line" id="sim-winrate-msg">Your win rate will be displayed after data load.</div>
            </div>

            <div>
            <div class="section-head">RECENT <span>SIMULATIONS</span></div>
            <div class="matches-list" id="recent-matches-list">
                <!-- filled by _renderRecentMatches -->
            </div>
            </div>

            <div>
            <div class="section-head">GLOBAL <span>OPERATOR RANKINGS</span></div>
            <div class="leaderboard" id="leaderboard-container">
                <!-- filled by _renderLeaderboard -->
            </div>
            </div>

        </div>

        <!-- Searching overlay (hidden by default) -->
        <div id="match-searching" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:100; align-items:center; justify-content:center;">
            <div style="text-align:center;">
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
    `;

    if (window.lucide) window.lucide.createIcons();

    // Fetch data and populate UI
    _loadProfileAndPopulate();

    // Matchmaking (Deploy Simulation)
    let searchInterval = null;
    let searchSeconds  = 0;

    const btnDeploy = document.getElementById('btn-deploy');
    const btnCancel = document.getElementById('btn-cancel-search');
    const searchingOverlay = document.getElementById('match-searching');

    btnDeploy.addEventListener('click', () => {
        // Show searching overlay
        searchingOverlay.style.display = 'flex';
        // Reset timer
        searchSeconds = 0;
        if (searchInterval) clearInterval(searchInterval);
        searchInterval = setInterval(() => {
            searchSeconds++;
            const s = String(searchSeconds % 60).padStart(2, '0');
            const m = String(Math.floor(searchSeconds / 60)).padStart(2, '0');
            const el = document.getElementById('search-elapsed');
            if (el) el.textContent = `${m}:${s}`;
        }, 1000);

        // Listen for game start ONCE (we'll remove listener after navigation)
        const gameStartHandler = (data) => {
            clearInterval(searchInterval);
            window.gameState.game = data; // save game state
            window.appSocket.off('gameStart', gameStartHandler); // cleanup
            window.appRouter.navigate('game');
        };
        window.appSocket.on('gameStart', gameStartHandler);

        // Emit join queue request
        window.appSocket.emit('joinQueue', {
            userId: window.gameState.userId, // set after profile load
            token:  window.gameState.token
        });
    });

    btnCancel.addEventListener('click', () => {
        clearInterval(searchInterval);
        searchingOverlay.style.display = 'none';
        searchSeconds = 0;
        // Optionally emit a cancel event to server if supported
    });

    // Navigation / other buttons
    document.getElementById('btn-collection').addEventListener('click', () => {
        // Placeholder: navigate to collection page
        window.appRouter.navigate('collection');  // must be implemented later
    });

    document.getElementById('btn-leaderboard').addEventListener('click', () => {
        // Scroll to leaderboard section (anchor)
        document.getElementById('leaderboard-container').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btn-config').addEventListener('click', () => {
        // Placeholder: system config (not implemented)
        console.log('System Config not yet available.');
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        window.clearAuth();
        window.appRouter.navigate('login');
    });

    // Helper: load profile & stats, then update DOM
    async function _loadProfileAndPopulate() {
        try {
            const profile = await window.api.getProfile();   // calls GET /api/profile
            // Update global state
            window.gameState.userId = profile.userId;
            window.gameState.username = profile.username;
            window.gameState.avatar = profile.avatar;

            // Sidebar
            document.getElementById('cmd-avatar').textContent = profile.username.slice(0, 2).toUpperCase();
            document.getElementById('cmd-name').textContent = profile.username.toUpperCase();
            document.getElementById('cmd-wins').textContent = profile.wins || 0;
            document.getElementById('cmd-losses').textContent = profile.losses || 0;
            const rate = profile.gamesPlayed > 0 ? Math.round((profile.wins / profile.gamesPlayed) * 100) : 0;
            document.getElementById('cmd-rate').textContent = rate + '%';

            // Win rate message
            const winMsgEl = document.getElementById('sim-winrate-msg');
            if (winMsgEl) {
                winMsgEl.textContent = rate >= 50
                    ? 'Your win rate is above average today. Tactical advantage confirmed.'
                    : 'Keep training, Commander. Success requires sacrifice.';
            }

            // Fetch and render recent matches
            const recentMatches = await window.api.getRecentMatches();
            _renderRecentMatches(recentMatches);

            // Fetch and render leaderboard
            const leaderboard = await window.api.getLeaderboard();
            _renderLeaderboard(leaderboard, profile.userId);
        } catch (err) {
            console.error('[Menu] Failed to load profile data:', err);
            // Fallback: keep placeholders
        }
    }

    // Render recent matches list
    function _renderRecentMatches(matches = []) {
        const container = document.getElementById('recent-matches-list');
        if (!container) return;
        if (!matches.length) {
            container.innerHTML = '<div class="match-row" style="justify-content:center;opacity:0.6;">No recent simulations</div>';
            return;
        }
        container.innerHTML = matches.map(m => {
            const winClass = m.result === 'win' ? 'win' : 'loss';
            const resultText = m.result === 'win' ? 'WIN' : 'FAIL';
            return `
            <div class="match-row ${winClass}">
                <div class="match-result">${resultText}</div>
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

    // Render leaderboard table
    function _renderLeaderboard(entries = [], currentUserId) {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;
        if (!entries.length) {
            container.innerHTML = '<div style="opacity:0.6; text-align:center; padding:20px;">Leaderboard data unavailable</div>';
            return;
        }
        let html = `
        <div class="lb-header">
            <span>#</span><span>Operator</span><span>Wins</span><span>Lost</span><span>Win %</span>
        </div>`;
        entries.forEach(entry => {
            const isYou = entry.userId === currentUserId;
            const rankClass = entry.rank <= 3 ? ['gold','silver','bronze'][entry.rank-1] : '';
            html += `
            <div class="lb-row${isYou ? ' you' : ''}">
                <div class="lb-rank ${rankClass}">${entry.rank}</div>
                <div class="lb-name${isYou ? ' you-name' : ''}">${entry.username}${isYou ? ' ◀ YOU' : ''}</div>
                <div class="lb-val wins">${entry.wins}</div>
                <div class="lb-val losses">${entry.losses}</div>
                <div class="lb-val rate${isYou ? ' style="color:var(--gold);"' : ''}">${entry.winRate}%</div>
            </div>`;
        });
        container.innerHTML = html;
    }
}

// Register the route with the correct page ID 'lobby'
window.appRouter.register('lobby', renderMenuPage);