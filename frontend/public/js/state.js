// js/state.js

const gameState = {

    userId: null,
    token: null,

    username: '',
    avatar: 'assets/images/default-avatar.png',

    currentPage: null,   // 'login' | 'register' | 'lobby' | 'game'

    game: null,
    /*
        Структура game після gameStart:
        {
        roomId: 'abc123',
        turnNumber: 1,
        currentTurn: 'you' | 'opponent',   // чия зараз черга
        turnTimeLeft: 30,                   // секунд залишилось

        you: {
            userId: 'u1',
            username: 'IronHero2099',
            avatar: '...',
            hp: 20,
            hand: [ ...масив карт у руці ],   // об'єкти Card
            field: [ null, null, null ],       // 3 слоти на полі
        },
        opponent: {
            userId: 'u2',
            username: 'Villain42',
            avatar: '...',
            hp: 20,
            handCount: 5,                      // кількість (не показуємо карти)
            field: [ null, null, null ],
        }
        }
    */
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
    gameState.token   = null;
    gameState.userId  = null;
    gameState.username = '';
    gameState.avatar  = 'assets/images/default-avatar.png';
    localStorage.removeItem('mb_token');
}

window.gameState  = gameState;
window.setToken   = setToken;
window.loadToken  = loadToken;
window.clearAuth  = clearAuth;