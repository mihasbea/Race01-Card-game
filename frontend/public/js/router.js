const appRouter = (() => {
    const routes = {};

    function register(hash, renderFn) {
        routes[hash] = renderFn;
    }

    function navigate(hash) {
        window.location.hash = hash;
        _render(hash);
    }

    function _render(hash) {
        const renderFn = routes[hash];
        if (!renderFn) {
            console.warn(`[Router] Unknown route: "${hash}", redirect → login`);
            navigate('login');
            return;
        }

        window.gameState.currentPage = hash;
        const app = document.getElementById('app');
        app.innerHTML = '';
        renderFn(app);
    }

    function getCurrentRoute() {
        return window.gameState.currentPage || 'login';
    }

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'login';
        _render(hash);
    });

    function init() {
        const token = window.loadToken();
        const startHash = token ? 'lobby' : 'login';
        navigate(startHash);
    }

    return { register, navigate, init, getCurrentRoute };
})();

window.appRouter = appRouter;