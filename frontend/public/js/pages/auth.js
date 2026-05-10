function renderLoginPage(container) {
    container.innerHTML = `
    <div class="page" id="page-login">
    <div class="login-bg">
        <div class="login-bg-sweep"></div>
        <div class="login-bg-circuit"></div>
        <div class="login-bg-glow blue"></div>
        <div class="login-bg-glow gold"></div>
    </div>

    <div style="display:flex;align-items:center;justify-content:center;height:100%;gap:56px;position:relative;z-index:1;">

        <div class="login-promo">
        <div class="login-logo">
            <div class="eyebrow">CLASSIFIED SYSTEM</div>
            <h1>J.A.R.V.I.S<br><span>COMBAT</span></h1>
            <div class="tagline">Tactical simulation engine</div>
        </div>

        <div style="font-family:var(--F-mono);font-size:10px;letter-spacing:0.5px;color:var(--j-blue);line-height:1.7;border-left:2px solid var(--j-blue);padding-left:14px;opacity:0.85;">
            ▸ System initialization complete.<br>
            ▸ Combat unit database loaded. 20 entities indexed.<br>
            ▸ Threat simulation protocols armed.<br>
            ▸ Awaiting Commander authentication.
        </div>

        <div class="login-features">
            <div class="login-feature">
            <div class="feat-dot blue"></div>
            Turn-based tactical combat — heroes vs. villain threats
            </div>
            <div class="login-feature">
            <div class="feat-dot gold"></div>
            20 combat units available at launch, more to be unlocked in future updates
            </div>
            <div class="login-feature">
            <div class="feat-dot ally"></div>
            Real-time simulation duels against global operators
            </div>
            <div class="login-feature">
            <div class="feat-dot blue"></div>
            Deep combat stats and post-match analysis
            </div>
            <div class="login-feature">
            <div class="feat-dot gold"></div>
            Climb the global simulation leaderboard
            </div>
        </div>

        <div class="login-build">JARVIS AI ENGINE · ALL SIMULATIONS CLASSIFIED</div>
        </div>

        <div class="login-card" style="position:relative;">
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <div style="font-family:var(--F-mono);font-size:9px;letter-spacing:3px;color:var(--text-dim);margin-bottom:20px;text-transform:uppercase;">Commander Authentication Protocol</div>

        <div class="login-card-tabs">
            <div class="login-card-tab active" data-tab="login-form">Authenticate</div>
            <div class="login-card-tab" data-tab="register-form">New Operative</div>
        </div>

        <form id="login-form" class="login-form">
            <div class="form-group">
            <label class="form-label" for="login-username">Commander ID / Neural Signature</label>
            <input type="text" class="form-input" id="login-username" placeholder="commander_id">
            <span class="field-error" id="err-login-username"></span>
            </div>
            <div class="form-group">
            <label class="form-label" for="login-password">Authorization Code</label>
            <input type="password" class="form-input" id="login-password" placeholder="••••••••••">
            <span class="field-error" id="err-login-password"></span>
            </div>
            <div class="form-general-error" id="err-login-general" style="display:none;"></div>
            <button type="submit" class="btn btn-primary" id="login-submit-btn">
            INITIATE SESSION
            </button>
            <div class="login-footer">
            <a class="switch-tab-link" data-tab="register-form">Reset authorization code</a>
            </div>
        </form>

        <form id="register-form" class="register-form" style="display:none;">
            <div class="form-group">
            <label class="form-label" for="reg-username">Commander Designation</label>
            <input type="text" class="form-input" id="reg-username" placeholder="commander_id">
            <span class="field-error" id="err-reg-username"></span>
            </div>
            <div class="form-group">
            <label class="form-label" for="reg-email">Secure Channel Address</label>
            <input type="email" class="form-input" id="reg-email" placeholder="operator@jarvis.combat">
            <span class="field-error" id="err-reg-email"></span>
            </div>
            <div class="form-group">
            <label class="form-label" for="reg-password">Authorization Code</label>
            <input type="password" class="form-input" id="reg-password" placeholder="Min. 8 characters">
            <span class="field-error" id="err-reg-password"></span>
            </div>
            <div class="form-group">
            <label class="form-label" for="reg-password2">Confirm Authorization Code</label>
            <input type="password" class="form-input" id="reg-password2" placeholder="Repeat code">
            <span class="field-error" id="err-reg-password2"></span>
            </div>
            <div class="form-general-error" id="err-reg-general" style="display:none;"></div>
            <button type="submit" class="btn btn-primary" id="reg-submit-btn">
            REGISTER OPERATIVE
            </button>
            <div class="login-footer">
            <a class="switch-tab-link" data-tab="login-form">Back to authentication</a>
            </div>
        </form>
        </div>

    </div>
    </div>
    `;

    // Cache DOM references after injection
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const regSubmitBtn = document.getElementById('reg-submit-btn');

    // Error spans
    const errLoginUsername = document.getElementById('err-login-username');
    const errLoginPassword = document.getElementById('err-login-password');
    const errLoginGeneral = document.getElementById('err-login-general');

    const errRegUsername = document.getElementById('err-reg-username');
    const errRegEmail = document.getElementById('err-reg-email');
    const errRegPassword = document.getElementById('err-reg-password');
    const errRegPassword2 = document.getElementById('err-reg-password2');
    const errRegGeneral = document.getElementById('err-reg-general');

    // Input fields
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const regUsername = document.getElementById('reg-username');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regPassword2 = document.getElementById('reg-password2');

    // Helper to clear all errors
    function clearErrors(formType) {
        if (formType === 'login') {
            [errLoginUsername, errLoginPassword].forEach(el => el.textContent = '');
            [loginUsername, loginPassword].forEach(inp => inp.classList.remove('input-error'));
            errLoginGeneral.style.display = 'none';
            errLoginGeneral.textContent = '';
        } else {
            [errRegUsername, errRegEmail, errRegPassword, errRegPassword2].forEach(el => el.textContent = '');
            [regUsername, regEmail, regPassword, regPassword2].forEach(inp => inp.classList.remove('input-error'));
            errRegGeneral.style.display = 'none';
            errRegGeneral.textContent = '';
        }
    }

    function showFieldError(errorElement, input, message) {
        errorElement.textContent = message;
        input.classList.add('input-error');
    }

    function showGeneralError(formType, message) {
        const generalEl = formType === 'login' ? errLoginGeneral : errRegGeneral;
        generalEl.textContent = message;
        generalEl.style.display = 'block';
    }

    // Tab switching logic
    function switchTab(targetFormId) {
        // Update tabs active state
        document.querySelectorAll('.login-card-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === targetFormId);
        });
        // Show/hide forms
        loginForm.style.display = targetFormId === 'login-form' ? 'block' : 'none';
        registerForm.style.display = targetFormId === 'register-form' ? 'block' : 'none';
        // Clear errors on the hidden form
        clearErrors('login');
        clearErrors('register');
    }

    // Event delegation for tab clicks and switch links
    container.addEventListener('click', (e) => {
        const tab = e.target.closest('.login-card-tab');
        if (tab) {
            const target = tab.dataset.tab;
            if (target) switchTab(target);
            return;
        }
        const link = e.target.closest('.switch-tab-link');
        if (link) {
            const target = link.dataset.tab;
            if (target) switchTab(target);
        }
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors('login');

        const username = loginUsername.value.trim();
        const password = loginPassword.value;

        let valid = true;
        if (!username) {
            showFieldError(errLoginUsername, loginUsername, 'Enter commander ID');
            valid = false;
        }
        if (!password) {
            showFieldError(errLoginPassword, loginPassword, 'Enter authorization code');
            valid = false;
        }
        if (!valid) return;

        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = 'AUTHENTICATING...';

        try {
            const result = await window.api.login(username, password);
            window.setToken(result.token);
            window.gameState.username = result.username || username;

            // Redirect to lobby (main menu)
            window.appRouter.navigate('lobby');
        } catch (err) {
            showGeneralError('login', err.message || 'Authentication failed. Please try again.');
            loginSubmitBtn.disabled = false;
            loginSubmitBtn.textContent = 'INITIATE SESSION';
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors('register');

        const username = regUsername.value.trim();
        const email = regEmail.value.trim();
        const password = regPassword.value;
        const password2 = regPassword2.value;

        let valid = true;

        if (!username) {
            showFieldError(errRegUsername, regUsername, 'Choose a commander designation');
            valid = false;
        }
        if (!email || !email.includes('@')) {
            showFieldError(errRegEmail, regEmail, 'Enter a valid secure channel address');
            valid = false;
        }
        if (!password || password.length < 8) {
            showFieldError(errRegPassword, regPassword, 'Authorization code must be at least 8 characters');
            valid = false;
        }
        if (password !== password2) {
            showFieldError(errRegPassword2, regPassword2, 'Codes do not match');
            valid = false;
        }
        if (!valid) return;

        regSubmitBtn.disabled = true;
        regSubmitBtn.textContent = 'ENLISTING...';

        try {
            const result = await window.api.register(username, email, password);
            // Auto login after registration (token already returned)
            window.setToken(result.token);
            window.gameState.username = result.username || username;

            window.appRouter.navigate('lobby');
        } catch (err) {
            showGeneralError('register', err.message || 'Registration failed. Please try again.');
            regSubmitBtn.disabled = false;
            regSubmitBtn.textContent = 'REGISTER OPERATIVE';
        }
    });
}

// Register route
window.appRouter.register('login', renderLoginPage);