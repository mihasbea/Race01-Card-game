// js/state.js

const gameState = {

    userId: null,
    token: null,

    username: '',
    avatar: 'assets/images/default-avatar.png',

    currentPage: null,   // 'login' | 'register' | 'lobby' | 'game'

    game: null,
};

function setToken(token) {
    gameState.token = token;
    localStorage.setItem('mb_token', token);
}

function loadToken() {
    const saved = localStorage.getItem('mb_token');
    if (saved) {
        gameState.token = saved;
    }
    return gameState.token;
}

function clearAuth() {
    gameState.token = null;
    gameState.userId = null;
    gameState.username = '';
    gameState.avatar = 'assets/images/default-avatar.png';
    localStorage.removeItem('mb_token');
}

window.gameState = gameState;
window.setToken = setToken;
window.loadToken = loadToken;
window.clearAuth = clearAuth;