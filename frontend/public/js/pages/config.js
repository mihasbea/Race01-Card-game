function renderConfigPage(container) {
    if (!window.gameState.token) {
        window.appRouter.navigate('login');
        return;
    }

    const PRESETS = [
        { id: 'ironman', src: 'assets/avatars/ironman_icon.jpg'},
        { id: 'cap', src: 'assets/avatars/cap_icon.jpg'},
        { id: 'spiderman', src: 'assets/avatars/spiderman_icon.jpg'},
        { id: 'strange', src: 'assets/avatars/strange_icon.jpg'},
        { id: 'loki', src: 'assets/avatars/loki_icon.jpg'},
        { id: 'venom', src: 'assets/avatars/venom_icon.jpg'},
        { id: 'hutao', src: 'assets/avatars/hutao_icon.jpg'},
        { id: 'neuvillette', src: 'assets/avatars/neuvillette_icon.jpg'},
    ];

    container.innerHTML = `
        <div class="page" id="page-config">

            <!-- Header bar -->
            <div class="cfg-topbar">
                <button class="cfg-back-btn" id="cfg-back">
                    <span class="cfg-back-arrow">←</span>
                    <span>OPS CENTER</span>
                </button>
                <div class="cfg-topbar-title">SYSTEM <span>CONFIGURATION</span></div>
                <div class="cfg-topbar-id">
                    <span class="cfg-topbar-dot"></span>
                    <span id="cfg-topbar-user">${(window.gameState.username || 'COMMANDER').toUpperCase()}</span>
                </div>
            </div>

            <!-- Centered body -->
            <div class="cfg-body">
                <div class="cfg-content">

                    <!-- ① OPERATOR IDENTITY -->
                    <section class="cfg-section" id="sec-identity">
                        <div class="cfg-section-head">
                            <div class="cfg-section-num">01</div>
                            <div>
                                <div class="cfg-section-title">OPERATOR IDENTITY</div>
                                <div class="cfg-section-sub">Insignia and display callsign</div>
                            </div>
                            <div class="cfg-section-status" id="identity-status"></div>
                        </div>

                        <!-- Avatar block -->
                        <div class="cfg-card">
                            <div class="cfg-card-label">OPERATOR INSIGNIA</div>

                            <div class="cfg-avatar-row">
                                <!-- Live preview -->
                                <div class="cfg-avatar-preview-wrap">
                                    <div class="cfg-avatar-ring-2"></div>
                                    <div class="cfg-avatar-ring"></div>
                                    <div class="cfg-avatar-preview" id="cfg-avatar-preview">
                                        <span id="cfg-avatar-preview-initials">${window.gameState.username ? window.gameState.username.slice(0,2).toUpperCase() : '??'}</span>
                                        <img id="cfg-avatar-preview-img" src="" alt="" hidden>
                                    </div>
                                </div>

                                <div class="cfg-avatar-right">
                                    <div class="cfg-presets" id="cfg-presets">
                                        ${PRESETS.map(p => `
                                        <button class="cfg-preset" data-preset="${p.id}" data-src="${p.src}">
                                            <img class="cfg-preset-img" src="${p.src}" alt="" draggable="false">
                                        </button>`).join('')}
                                    </div>

                                    <div class="cfg-upload-row">
                                        <span class="cfg-upload-label">OR UPLOAD CUSTOM</span>
                                        <label class="cfg-upload-btn" for="cfg-avatar-file">
                                            ↑ BROWSE FILE
                                            <input type="file" id="cfg-avatar-file" accept="image/*" style="display:none;">
                                        </label>
                                        <span class="cfg-upload-hint" id="cfg-upload-hint">PNG / JPG · max 2 MB</span>
                                    </div>
                                </div>
                            </div>

                            <div class="cfg-avatar-save-row">
                                <div class="cfg-avatar-feedback" id="feedback-avatar"></div>
                                <button class="cfg-save-btn" id="btn-save-avatar">
                                    <span class="cfg-btn-text">SAVE INSIGNIA</span>
                                    <span class="cfg-btn-spinner" hidden>■ SAVING…</span>
                                </button>
                            </div>
                        </div>

                        <!-- Callsign -->
                        <div class="cfg-card cfg-card-fields">
                            <div class="form-group cfg-callsign-field">
                                <label class="form-label">CALLSIGN (display name)</label>
                                <input class="form-input" id="cfg-username" type="text" maxlength="24"
                                    placeholder="Your callsign" autocomplete="off"
                                    value="${window.gameState.username || ''}">
                                <span class="field-error" id="err-username"></span>
                            </div>

                            <div class="cfg-actions">
                                <div class="cfg-feedback" id="feedback-identity"></div>
                                <button class="cfg-save-btn" id="btn-save-identity">
                                    <span class="cfg-btn-text">SAVE IDENTITY</span>
                                    <span class="cfg-btn-spinner" hidden>■ SAVING…</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <div class="cfg-divider"></div>

                    <!-- ② SECURITY PROTOCOL -->
                    <section class="cfg-section" id="sec-security">
                        <div class="cfg-section-head">
                            <div class="cfg-section-num">02</div>
                            <div>
                                <div class="cfg-section-title">SECURITY PROTOCOL</div>
                                <div class="cfg-section-sub">Update access credentials — current password required</div>
                            </div>
                            <div class="cfg-section-status" id="security-status"></div>
                        </div>

                        <div class="cfg-card cfg-card-fields">
                            <div class="form-group">
                                <label class="form-label">CURRENT PASSWORD</label>
                                <div class="cfg-input-wrap">
                                    <input class="form-input" id="cfg-pass-current" type="password"
                                        placeholder="Enter current password" autocomplete="current-password">
                                    <button class="cfg-eye-btn" data-target="cfg-pass-current" tabindex="-1">◎</button>
                                </div>
                                <span class="field-error" id="err-pass-current"></span>
                            </div>

                            <div class="cfg-field-row">
                                <div class="form-group cfg-field">
                                    <label class="form-label">NEW PASSWORD</label>
                                    <div class="cfg-input-wrap">
                                        <input class="form-input" id="cfg-pass-new" type="password"
                                            placeholder="Min 8 characters" autocomplete="new-password">
                                        <button class="cfg-eye-btn" data-target="cfg-pass-new" tabindex="-1">◎</button>
                                    </div>
                                    <span class="field-error" id="err-pass-new"></span>
                                    <div class="cfg-strength-wrap" id="strength-wrap" hidden>
                                        <div class="cfg-strength-track">
                                            <div class="cfg-strength-fill" id="strength-fill"></div>
                                        </div>
                                        <span class="cfg-strength-label" id="strength-label"></span>
                                    </div>
                                </div>
                                <div class="form-group cfg-field">
                                    <label class="form-label">CONFIRM NEW PASSWORD</label>
                                    <div class="cfg-input-wrap">
                                        <input class="form-input" id="cfg-pass-confirm" type="password"
                                            placeholder="Repeat new password" autocomplete="new-password">
                                        <button class="cfg-eye-btn" data-target="cfg-pass-confirm" tabindex="-1">◎</button>
                                    </div>
                                    <span class="field-error" id="err-pass-confirm"></span>
                                </div>
                            </div>

                            <div class="cfg-actions">
                                <div class="cfg-feedback" id="feedback-security"></div>
                                <button class="cfg-save-btn cfg-save-btn--security" id="btn-save-security">
                                    <span class="cfg-btn-text">UPDATE PASSWORD</span>
                                    <span class="cfg-btn-spinner" hidden>■ SAVING…</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    <div style="height:48px;"></div>
                </div>
            </div>
        </div>
    `;

    let selectedPreset = null; 
    let customAvatarFile = null; 

    (async () => {
        try {
            const profile = await window.api.getProfile(); 
            document.getElementById('cfg-username').value = profile.username || '';
            document.getElementById('cfg-topbar-user').textContent = (profile.username || 'COMMANDER').toUpperCase();

            if (profile.avatarPreset) {
                const preset = PRESETS.find(p => p.id === profile.avatarPreset);
                if (preset) _selectPreset(preset);
            } else if (profile.avatarUrl) {
                _setPreviewImage(profile.avatarUrl);
            } else if (profile.username) {
                _setPreviewInitials(profile.username.slice(0, 2).toUpperCase());
            }
        } catch { /* non-fatal */ }
    })();

    document.getElementById('cfg-back').addEventListener('click', () => {
        window.appRouter.navigate('lobby');
    });

    document.getElementById('cfg-presets').addEventListener('click', e => {
        const btn = e.target.closest('.cfg-preset');
        if (!btn) return;
        const preset = PRESETS.find(p => p.id === btn.dataset.preset);
        if (preset) _selectPreset(preset);
    });

    function _selectPreset(preset) {
        selectedPreset = preset;
        customAvatarFile = null;
        document.getElementById('cfg-upload-hint').textContent = 'PNG / JPG · max 2 MB';
        document.getElementById('cfg-upload-hint').style.color = '';

        document.querySelectorAll('.cfg-preset').forEach(b => b.classList.remove('active'));
        document.querySelector(`.cfg-preset[data-preset="${preset.id}"]`)?.classList.add('active');
        _setPreviewImage(preset.src);
    }

    function _setPreviewImage(src) {
        document.getElementById('cfg-avatar-preview-initials').hidden = true;
        const img = document.getElementById('cfg-avatar-preview-img');
        img.src    = src;
        img.hidden = false;
    }

    function _setPreviewInitials(text) {
        const initials = document.getElementById('cfg-avatar-preview-initials');
        initials.textContent = text;
        initials.hidden = false;
        document.getElementById('cfg-avatar-preview-img').hidden = true;
    }

    document.getElementById('cfg-avatar-file').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const hint = document.getElementById('cfg-upload-hint');

        if (file.size > 2 * 1024 * 1024) {
            hint.textContent = '⚠ File exceeds 2 MB limit';
            hint.style.color = 'var(--threat-hi)';
            return;
        }

        customAvatarFile = file;
        selectedPreset = null;
        document.querySelectorAll('.cfg-preset').forEach(b => b.classList.remove('active'));
        hint.style.color = 'var(--ally-hi)';

        const reader = new FileReader();
        reader.onload = ev => _setPreviewImage(ev.target.result);
        reader.readAsDataURL(file);
    });

    document.querySelectorAll('.cfg-eye-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            input.type      = input.type === 'password' ? 'text' : 'password';
            btn.textContent = input.type === 'password' ? '◎' : '◉';
        });
    });

    document.getElementById('cfg-pass-new').addEventListener('input', e => {
        const val  = e.target.value;
        const wrap = document.getElementById('strength-wrap');
        if (!val) { wrap.hidden = true; return; }
        wrap.hidden = false;

        const levels = [
            { pct: '20%',  color: 'var(--threat-hi)', label: 'WEAK'},
            { pct: '45%',  color: 'var(--warn-hi)',   label: 'FAIR'},
            { pct: '72%',  color: 'var(--j-blue)',    label: 'GOOD'},
            { pct: '100%', color: 'var(--ally-hi)',   label: 'STRONG'},
        ];
        const score = _scorePassword(val);
        const lvl = levels[Math.min(score, 3)];
        const fill = document.getElementById('strength-fill');
        const lbl = document.getElementById('strength-label');
        fill.style.width = lvl.pct;
        fill.style.background = lvl.color;
        lbl.textContent = lvl.label;
        lbl.style.color = lvl.color;
    });

    function _scorePassword(p) {
        let s = 0;
        if (p.length >= 8)  s++;
        if (p.length >= 12) s++;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
        if (/[^a-zA-Z0-9]/.test(p) || /\d/.test(p)) s++;
        return Math.min(s, 3);
    }
    document.getElementById('btn-save-avatar').addEventListener('click', async () => {
        _setFeedback('feedback-avatar', null);

        if (!selectedPreset && !customAvatarFile) {
            _setFeedback('feedback-avatar', 'Select a preset or upload an image first', 'error');
            return;
        }

        _setBtnLoading('btn-save-avatar', true);
        try {
            const fd = new FormData();
            if (selectedPreset)   fd.append('avatarPreset', selectedPreset.id);
            if (customAvatarFile) fd.append('avatarFile',   customAvatarFile);

            await window.api.updateProfile(fd);

            customAvatarFile = null;
            _setFeedback('feedback-avatar', '✓ Insignia updated', 'success');
            _setStatusBadge('identity-status', 'SAVED', 'success');
        } catch (err) {
            _setFeedback('feedback-avatar', err?.message || 'Update failed. Try again.', 'error');
            _setStatusBadge('identity-status', 'ERROR', 'error');
        } finally {
            _setBtnLoading('btn-save-avatar', false);
        }
    });

    document.getElementById('btn-save-identity').addEventListener('click', async () => {
        const username = document.getElementById('cfg-username').value.trim();
        _clearErrors(['err-username']);
        _setFeedback('feedback-identity', null);

        if (!username) { _setError('err-username', 'Callsign is required'); return; }
        if (username.length < 3) { _setError('err-username', 'Minimum 3 characters'); return; }

        _setBtnLoading('btn-save-identity', true);
        try {
            const fd = new FormData();
            fd.append('username', username);

            await window.api.updateProfile(fd);

            window.gameState.username = username;
            document.getElementById('cfg-topbar-user').textContent = username.toUpperCase();
            _setFeedback('feedback-identity', '✓ Callsign updated successfully', 'success');
            _setStatusBadge('identity-status', 'SAVED', 'success');
        } catch (err) {
            _setFeedback('feedback-identity', err?.message || 'Update failed. Try again.', 'error');
            _setStatusBadge('identity-status', 'ERROR', 'error');
        } finally {
            _setBtnLoading('btn-save-identity', false);
        }
    });

    document.getElementById('btn-save-security').addEventListener('click', async () => {
        const current = document.getElementById('cfg-pass-current').value;
        const next    = document.getElementById('cfg-pass-new').value;
        const confirm = document.getElementById('cfg-pass-confirm').value;

        _clearErrors(['err-pass-current', 'err-pass-new', 'err-pass-confirm']);
        _setFeedback('feedback-security', null);

        let valid = true;
        if (!current) { _setError('err-pass-current', 'Current password is required'); valid = false; }
        if (!next || next.length < 8) { _setError('err-pass-new',     'Minimum 8 characters'); valid = false; }
        if (next && confirm !== next) { _setError('err-pass-confirm', 'Passwords do not match'); valid = false; }
        if (!valid) return;

        _setBtnLoading('btn-save-security', true);
        try {
            await window.api.changePassword({ currentPassword: current, newPassword: next });

            ['cfg-pass-current', 'cfg-pass-new', 'cfg-pass-confirm']
                .forEach(id => { document.getElementById(id).value = ''; });
            document.getElementById('strength-wrap').hidden = true;

            _setFeedback('feedback-security', '✓ Password updated. New credentials are active.', 'success');
            _setStatusBadge('security-status', 'SAVED', 'success');
        } catch (err) {
            const msg = err?.message || 'Failed to update password. Try again.';
            _setFeedback('feedback-security', msg, 'error');
            if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('invalid')) {
                _setError('err-pass-current', 'Current password is incorrect');
            }
            _setStatusBadge('security-status', 'ERROR', 'error');
        } finally {
            _setBtnLoading('btn-save-security', false);
        }
    });


    function _setError(id, msg) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = msg;
        const prev  = el.previousElementSibling;
        const input = prev?.tagName === 'DIV' ? prev.querySelector('.form-input') : prev;
        input?.classList.add('input-error');
    }

    function _clearErrors(ids) {
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
        document.querySelectorAll('.form-input.input-error')
            .forEach(el => el.classList.remove('input-error'));
    }

    function _setFeedback(id, msg, type) {
        const el = document.getElementById(id);
        if (!el) return;
        if (!msg) { el.textContent = ''; el.className = 'cfg-feedback'; return; }
        el.textContent = msg;
        el.className   = `cfg-feedback cfg-feedback--${type}`;
    }

    function _setBtnLoading(id, loading) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = loading;
        btn.querySelector('.cfg-btn-text').hidden    =  loading;
        btn.querySelector('.cfg-btn-spinner').hidden = !loading;
    }

    function _setStatusBadge(id, text, type) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
        el.className   = `cfg-section-status cfg-section-status--${type}`;
        setTimeout(() => { el.textContent = ''; el.className = 'cfg-section-status'; }, 4000);
    }
}

window.appRouter.register('config', renderConfigPage);