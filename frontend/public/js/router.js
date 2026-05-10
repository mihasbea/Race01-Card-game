const appRouter = (() => {
    // Route dictionary: { ‘login’: renderFn, ... }
    const routes = {};

    /**
     * Registers a route.
     * @param {string} hash - a key (‘login’, ‘register’, ‘lobby’, ‘game’)
     * @param {Function} renderFn - a function that renders the page in #app
     */
    function register(hash, renderFn) {
        routes[hash] = renderFn;
    }

    /**
     * Navigates to the page.
     * If the hash is already active, it simply reloads the page.
     */
    function navigate(hash) {
        window.location.hash = hash;
        _render(hash);
    }

    /**
   * Renders the current page.
   */
    function _render(hash) {
        const renderFn = routes[hash];
        if (!renderFn) {
        // Unknown route — redirect to login
        console.warn(`[Router] Unknown route: "${hash}", redirect → login`);
        navigate('login');
        return;
        }

        window.gameState.currentPage = hash;
        const app = document.getElementById('app');
        app.innerHTML = ''; // Clear the previous page
        renderFn(app); // Render the new page
    }

    /**
     * Listens for hash changes (back button in the browser).
     */
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'login';
        _render(hash);
    });

    /**
     * Initialization: runs on the first load.
     * Checks the token → if it exists, we go to the lobby, otherwise → login.
     */
    function init() {
        const token = window.loadToken();
        const startHash = token ? 'lobby' : 'login';
        navigate(startHash);
    }

    return { register, navigate, init };
})();

// Apply globally
window.appRouter = appRouter;