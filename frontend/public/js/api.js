const API_BASE = 'http://localhost:3000/api';

// Helper function for the actual fetch (not currently called) 
async function _request(method, endpoint, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (window.gameState.token) {
        headers['Authorization'] = `Bearer ${window.gameState.token}`;
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || 'Server error');
    }
    return res.json();
}


//  PLACEHOLDERS  (replace with an actual fetch after connecting to the database)


/**
 * Register a new player.
 * @param {string} username  - username (3–20 characters)
 * @param {string} password  - password (min. 8 characters)
 * @returns {Promise<{token: string}>}
 *
 * ACTUAL CALL (uncomment later):
 * return _request(‘POST’, ‘/auth/register’, { username, password });
 */
async function apiRegister(username, email, password) {
    return _request('POST', '/auth/register', { username, email, password });
}

/**
 * Login an existing player.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{token: string}>}
 *
 * ACTUAL CALL (uncomment later):
 * return _request('POST', '/auth/login', { username, password });
 */
async function apiLogin(username, password) {
    return _request('POST', '/auth/login', { username, password });
}

/**
 * Get the current player's profile (by token).
 * @returns {Promise<{userId, username, avatar, wins, losses}>}
 *
 * ACTUAL CALL (uncomment later):
 * return _request(‘GET’, ‘/users/me’);
 */
async function apiGetProfile() {
    return _request('GET', '/users/me');
}

async function apiGetRecentMatches() {
    return _request('GET', '/matches/recent');
}
window.apiGetRecentMatches = apiGetRecentMatches;

async function apiGetLeaderboard() {
    return _request('GET', '/leaderboard');
}
window.apiGetLeaderboard = apiGetLeaderboard;

window.apiGetLeaderboard = apiGetLeaderboard;

// Attach to the window
window.api = {
    register: apiRegister,
    login: apiLogin,
    getProfile: apiGetProfile,
    getRecentMatches: apiGetRecentMatches,
    getLeaderboard: apiGetLeaderboard,
};