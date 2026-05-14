(function () {

const ALL_CARDS = [
    {
        id: 'ironman', faction: 'hero',
        name: 'Iron Man', realName: 'Tony Stark', alias: 'IRON MAN',
        artClass: 'art-ironman', cost: 6, atk: 8, def: 6, hp: 12,
        lore: 'Genius inventor in an armored suit. He combines engineering, firepower, and tactical improvisation.',
    },
    {
        id: 'thor', faction: 'hero',
        name: 'Thor', realName: 'Thor Odinson', alias: 'THOR',
        artClass: 'art-thor', cost: 7, atk: 10, def: 6, hp: 12,
        lore: 'The Asgardian God of Thunder. He fights with immense power, confidence, and a warrior’s honor.',
    },
    {
        id: 'cap', faction: 'hero',
        name: 'Captain America', realName: 'Steve Rogers', alias: 'CAPT. AMERICA',
        artClass: 'art-cap', cost: 5, atk: 7, def: 8, hp: 10,
        lore: 'A symbol of discipline and resolve. Steve Rogers leads from the front and never abandons his team.',
    },
    {
        id: 'hulk', faction: 'hero',
        name: 'Hulk', realName: 'Bruce Banner', alias: 'HULK',
        artClass: 'art-hulk', cost: 7, atk: 11, def: 4, hp: 15,
        lore: 'A devastating gamma-powered force. The angrier he gets, the harder he hits.',
    },
    {
        id: 'strange', faction: 'hero',
        name: 'Doctor Strange', realName: 'Stephen Strange', alias: 'DR. STRANGE',
        artClass: 'art-strange', cost: 6, atk: 9, def: 6, hp: 13,
        lore: 'Master of the mystic arts and protector of reality, bending the impossible with precision and spells.',
    },
    {
        id: 'spiderman', faction: 'hero',
        name: 'Spider-Man', realName: 'Peter Parker', alias: 'SPIDER-MAN',
        artClass: 'art-spiderman', cost: 5, atk: 7, def: 8, hp: 9,
        lore: 'A young hero with quick reflexes, web-slinging agility, and relentless determination to do the right thing.',
    },
    {
        id: 'widow', faction: 'hero',
        name: 'Black Widow', realName: 'Natasha Romanoff', alias: 'BLACK WIDOW',
        artClass: 'art-widow', cost: 4, atk: 6, def: 5, hp: 11,
        lore: 'A master spy and combat specialist who turns intelligence, speed, and precision into a lethal edge.',
    },
    {
        id: 'panther', faction: 'hero',
        name: 'Black Panther', realName: "T'Challa", alias: 'BLACK PANTHER',
        artClass: 'art-panther', cost: 6, atk: 8, def: 7, hp: 11,
        lore: 'King of Wakanda, warrior, and strategist, protected by vibranium and guided by duty to his people.',
    },
    {
        id: 'hawkeye', faction: 'hero',
        name: 'Hawkeye', realName: 'Clint Barton', alias: 'HAWKEYE',
        artClass: 'art-hawkeye', cost: 3, atk: 7, def: 3, hp: 8,
        lore: 'An elite archer whose accuracy and battlefield instincts let him stand beside gods and monsters.',
    },
    {
        id: 'antman', faction: 'hero',
        name: 'Ant-Man', realName: 'Scott Lang', alias: 'ANT-MAN',
        artClass: 'art-antman', cost: 4, atk: 6, def: 6, hp: 9,
        lore: 'A clever hero with size-changing tech and improvisation that turns small advantages into big wins.',
    },
    {
        id: 'wanda', faction: 'hero',
        name: 'Scarlet Witch', realName: 'Wanda Maximoff', alias: 'SCARLET WITCH',
        artClass: 'art-wanda', cost: 6, atk: 10, def: 4, hp: 11,
        lore: 'A reality-warping sorceress whose chaos magic can reshape the battlefield in an instant.',
    },
    {
        id: 'vision', faction: 'hero',
        name: 'Vision', realName: 'Vision', alias: 'VISION',
        artClass: 'art-vision', cost: 6, atk: 8, def: 7, hp: 12,
        lore: 'An android built from advanced technology and synthetic consciousness, combining logic, restraint, and power.',
    },
    {
        id: 'bucky', faction: 'hero',
        name: 'Winter Soldier', realName: 'James Buchanan Barnes', alias: 'WINTER SOLDIER',
        artClass: 'art-bucky', cost: 5, atk: 8, def: 5, hp: 10,
        lore: 'A hardened operative rebuilt by trauma and conditioning, deadly in close combat and difficult to stop.',
    },
    {
        id: 'falcon', faction: 'hero',
        name: 'Falcon', realName: 'Sam Wilson', alias: 'FALCON',
        artClass: 'art-falcon', cost: 4, atk: 6, def: 5, hp: 9,
        lore: 'An aerial combat expert who controls the sky with speed, discipline, and tactical awareness.',
    },
    {
        id: 'warmachine', faction: 'hero',
        name: 'War Machine', realName: 'James Rhodes', alias: 'WAR MACHINE',
        artClass: 'art-warmachine', cost: 5, atk: 8, def: 6, hp: 10,
        lore: 'Military precision in a heavily armed armored suit, delivering disciplined firepower under pressure.',
    },

    {
        id: 'thanos', faction: 'villain',
        name: 'Thanos', realName: 'Thanos', alias: 'THE MAD TITAN',
        artClass: 'art-thanos', cost: 7, atk: 10, def: 5, hp: 15,
        lore: 'A titan obsessed with balance through annihilation, using overwhelming strength to impose his vision on the universe.',
    },
    {
        id: 'loki', faction: 'villain',
        name: 'Loki', realName: 'Loki Laufeyson', alias: 'GOD OF MISCHIEF',
        artClass: 'art-loki', cost: 5, atk: 7, def: 6, hp: 10,
        lore: 'A master manipulator who survives by deception, illusion, and shifting allegiance whenever it suits him.',
    },
    {
        id: 'ultron', faction: 'villain',
        name: 'Ultron', realName: 'Ultron', alias: 'GENOCIDAL AI',
        artClass: 'art-ultron', cost: 6, atk: 7, def: 7, hp: 12,
        lore: 'An artificial intelligence that concluded humanity was the problem and sought to replace mercy with extinction.',
    },
    {
        id: 'hela', faction: 'villain',
        name: 'Hela', realName: 'Hela Odinsdottir', alias: 'GODDESS OF DEATH',
        artClass: 'art-hela', cost: 7, atk: 9, def: 7, hp: 12,
        lore: 'The Asgardian goddess of death, returning with overwhelming power and a claim to conquest.',
    },
    {
        id: 'magneto', faction: 'villain',
        name: 'Magneto', realName: 'Erik Lehnsherr', alias: 'MASTER OF MAGNETISM',
        artClass: 'art-magneto', cost: 6, atk: 9, def: 5, hp: 11,
        lore: 'A mutant revolutionary whose control of magnetism makes him one of the most formidable enemies on the board.',
    },
    {
        id: 'venom', faction: 'villain',
        name: 'Venom', realName: 'Eddie Brock', alias: 'WE ARE VENOM',
        artClass: 'art-venom', cost: 6, atk: 9, def: 6, hp: 11,
        lore: 'A symbiote-bound predator driven by hunger, instinct, and a dangerous sense of justice.',
    },
    {
        id: 'redskull', faction: 'villain',
        name: 'Red Skull', realName: 'Johann Schmidt', alias: 'HYDRA FÜHRER',
        artClass: 'art-redskull', cost: 5, atk: 8, def: 7, hp: 10,
        lore: 'A fanatical strategist and brutal extremist, weaponizing ideology, terror, and HYDRA resources.',
    },
    {
        id: 'modok', faction: 'villain',
        name: 'M.O.D.O.K.', realName: 'George Tarleton', alias: 'MENTAL ORGANISM',
        artClass: 'art-modok', cost: 4, atk: 7, def: 5, hp: 9,
        lore: 'A grotesquely overclocked intellect, dangerous because he can outthink almost anyone in the room.',
    },
    {
        id: 'crossbones', faction: 'villain',
        name: 'Crossbones', realName: 'Brock Rumlow', alias: 'HYDRA ENFORCER',
        artClass: 'art-crossbones', cost: 3, atk: 6, def: 4, hp: 8,
        lore: 'A ruthless mercenary and enforcer built for aggression, ambushes, and maximum collateral damage.',
    },
    {
        id: 'dormammu', faction: 'villain',
        name: 'Dormammu', realName: 'Dormammu', alias: 'LORD OF THE DARK DIMENSION',
        artClass: 'art-dormammu', cost: 6, atk: 10, def: 5, hp: 13,
        lore: 'A dimensional entity of immense mystical power, threatening everything with raw cosmic force.',
    },
    {
        id: 'taskmaster', faction: 'villain',
        name: 'Taskmaster', realName: 'Tony Masters', alias: 'PHOTOGRAPHIC REFLEXES',
        artClass: 'art-taskmaster', cost: 4, atk: 7, def: 4, hp: 11,
        lore: 'A mercenary who can copy combat styles after seeing them once, turning observation into a weapon.',
    },
    {
        id: 'abomination', faction: 'villain',
        name: 'Abomination', realName: 'Emil Blonsky', alias: 'GAMMA ENFORCER',
        artClass: 'art-abomination', cost: 6, atk: 9, def: 6, hp: 12,
        lore: 'A gamma-born brute whose raw physical power makes him one of the Hulk’s most dangerous opponents.',
    },
    {
        id: 'whiplash', faction: 'villain',
        name: 'Whiplash', realName: 'Ivan Vanko', alias: 'ARC WHIP WEAPONEER',
        artClass: 'art-whiplash', cost: 5, atk: 9, def: 5, hp: 10,
        lore: 'A vengeance-driven fighter using electrified whips and relentless aggression to punish his enemies.',
    },
    {
        id: 'ronan', faction: 'villain',
        name: 'Ronan', realName: 'Ronan the Accuser', alias: 'KREE SUPREME ACCUSER',
        artClass: 'art-ronan', cost: 5, atk: 8, def: 7, hp: 9,
        lore: 'A militant Kree zealot who treats judgment as a weapon and punishment as a principle.',
    },
    {
        id: 'goblin', faction: 'villain',
        name: 'Green Goblin', realName: 'Norman Osborn', alias: 'OSCORP PREDATOR',
        artClass: 'art-goblin', cost: 4, atk: 7, def: 4, hp: 9,
        lore: 'A brilliant industrialist twisted into a chaotic terror, blending technology, cunning, and madness.',
    },
];

const HEROES  = ALL_CARDS.filter(c => c.faction === 'hero');
const VILLAINS = ALL_CARDS.filter(c => c.faction === 'villain');

function renderCollectionPage(container) {
    if (!window.gameState?.token) {
        window.appRouter.navigate('login');
        return;
    }

    container.innerHTML = `
    <div class="page" id="page-collection">

        <div class="coll-topbar">
            <button class="coll-back-btn" id="coll-back">← BACK</button>
            <div class="coll-title">UNIT <span>REGISTRY</span>
                <span class="coll-count" id="coll-count-label">${ALL_CARDS.length} UNITS</span>
            </div>

            <div class="coll-topbar-right">
                <div class="coll-filter-tabs">
                    <button class="coll-tab tab-all active" data-filter="all">ALL</button>
                    <button class="coll-tab tab-heroes" data-filter="hero">HEROES</button>
                    <button class="coll-tab tab-villains" data-filter="villain">VILLAINS</button>
                </div>
                <select class="coll-sort" id="coll-sort">
                    <option value="name">NAME</option>
                    <option value="cost">COST</option>
                    <option value="atk">ATTACK</option>
                    <option value="def">DEFENSE</option>
                    <option value="hp">HP</option>
                </select>
            </div>
        </div>

        <div class="coll-body" id="coll-body">
            <!-- populated by JS -->
        </div>

        <div class="coll-detail-overlay" id="coll-detail-overlay">
            <div class="coll-detail-panel" id="coll-detail-panel">
                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>
                <button class="coll-detail-close" id="coll-detail-close">✕</button>

                <div class="coll-detail-card" id="coll-detail-card">
                    <div class="gcrd-inner" id="coll-dc-inner">
                        <div class="gcrd-top-bar" id="coll-dc-bar"></div>
                        <div class="gcrd-cost" id="coll-dc-cost"></div>
                        <div class="gcrd-name" id="coll-dc-name"></div>
                        <div class="gcrd-alias" id="coll-dc-alias"></div>
                        <div class="gcrd-art" id="coll-dc-art">
                            <div class="gcrd-art-bg" id="coll-dc-artbg"></div>
                        </div>
                        <div class="gcrd-divider"></div>
                        <div class="gcrd-stats">
                            <div class="gcrd-stat atk">
                                <span class="gcrd-stat-icon">ATK</span>
                                <span id="coll-dc-atk"></span>
                            </div>
                            <div class="gcrd-stat def">
                                <span class="gcrd-stat-icon">DEF</span>
                                <span id="coll-dc-def"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="coll-detail-info">
                    <div class="coll-detail-faction" id="coll-di-faction"></div>
                    <div class="coll-detail-name" id="coll-di-name"></div>
                    <div class="coll-detail-realname" id="coll-di-realname"></div>
                    <div class="coll-detail-lore" id="coll-di-lore"></div>

                    <div class="coll-detail-stats" id="coll-di-stats">
                        ${_statRow('ATK', 'atk', 15)}
                        ${_statRow('DEF', 'def', 15)}
                        ${_statRow('HP',  'hp',  50)}
                        ${_statRow('COST','cost',10)}
                    </div>
                </div>
            </div>
        </div>

    </div>`;

    if (window.lucide) window.lucide.createIcons();

    let currentFilter = 'all';
    let currentSort   = 'name';

    const body   = document.getElementById('coll-body');
    const overlay = document.getElementById('coll-detail-overlay');

    function _getVisible() {
        let list = currentFilter === 'all' ? ALL_CARDS
                 : currentFilter === 'hero' ? HEROES : VILLAINS;

        return [...list].sort((a, b) => {
            if (currentSort === 'name') return a.name.localeCompare(b.name);
            return b[currentSort] - a[currentSort];
        });
    }

    function _render() {
        const cards = _getVisible();

        // update count label
        const countEl = document.getElementById('coll-count-label');
        if (countEl) countEl.textContent = `${cards.length} UNITS`;

        if (currentFilter === 'all') {
            const heroes   = cards.filter(c => c.faction === 'hero');
            const villains = cards.filter(c => c.faction === 'villain');
            body.innerHTML =
                `<div class="coll-section-label heroes-label">HEROES <span style="font-family:var(--F-mono);font-size:10px;color:var(--j-blue);opacity:.6">${heroes.length}</span></div>
                 <div class="coll-grid" id="grid-heroes">${heroes.map(_cardHTML).join('')}</div>
                 <div class="coll-section-label villains-label">VILLAINS <span style="font-family:var(--F-mono);font-size:10px;color:#a855f7;opacity:.6">${villains.length}</span></div>
                 <div class="coll-grid" id="grid-villains">${villains.map(_cardHTML).join('')}</div>`;
        } else {
            const label = currentFilter === 'hero' ? 'heroes-label' : 'villains-label';
            const title = currentFilter === 'hero' ? 'HEROES' : 'VILLAINS';
            body.innerHTML =
                `<div class="coll-section-label ${label}">${title} <span style="font-family:var(--F-mono);font-size:10px;opacity:.6">${cards.length}</span></div>
                 <div class="coll-grid">${cards.map(_cardHTML).join('')}</div>`;
        }

        // stagger animation delays
        body.querySelectorAll('.gcrd').forEach((el, i) => {
            el.style.animationDelay = `${i * 0.025}s`;
        });

        // click handlers
        body.querySelectorAll('.gcrd').forEach(el => {
            el.addEventListener('click', () => {
                const card = ALL_CARDS.find(c => c.id === el.dataset.cardId);
                if (card) _openDetail(card);
            });
        });
    }

    function _cardHTML(card) {
        const isVillain = card.faction === 'villain';
        return `
        <div class="gcrd ${isVillain ? 'villain-card' : 'hero-card'}" data-card-id="${card.id}">
            <div class="gcrd-inner">
                <div class="gcrd-top-bar"></div>
                <div class="gcrd-cost">${card.cost}</div>
                <div class="gcrd-name">${card.name}</div>
                <div class="gcrd-alias">${card.alias}</div>
                <div class="gcrd-art">
                    <div class="gcrd-art-bg ${card.artClass}"></div>
                </div>
                <div class="gcrd-divider"></div>
                <div class="gcrd-stats">
                    <div class="gcrd-stat atk">
                        <span class="gcrd-stat-icon">ATK</span>${card.atk}
                    </div>
                    <div class="gcrd-stat def">
                        <span class="gcrd-stat-icon">DEF</span>${card.def}
                    </div>
                </div>
            </div>
        </div>`;
    }

    function _openDetail(card) {
        const isVillain = card.faction === 'villain';
        const panel = document.getElementById('coll-detail-panel');
        panel.className = `coll-detail-panel ${isVillain ? 'villain-detail' : 'hero-detail'}`;

        // big card
        const dcCard = document.getElementById('coll-detail-card');
        dcCard.className = `coll-detail-card ${isVillain ? 'villain-card' : 'hero-card'}`;
        document.getElementById('coll-dc-cost').textContent = card.cost;
        document.getElementById('coll-dc-name').textContent = card.name;
        document.getElementById('coll-dc-alias').textContent = card.alias;
        document.getElementById('coll-dc-atk').textContent = card.atk;
        document.getElementById('coll-dc-def').textContent = card.def;
        const artBg = document.getElementById('coll-dc-artbg');
        artBg.className = `gcrd-art-bg ${card.artClass}`;

        // info
        const factionEl = document.getElementById('coll-di-faction');
        factionEl.className = `coll-detail-faction ${isVillain ? 'villain' : 'hero'}`;
        factionEl.textContent = isVillain ? '⚠ VILLAIN UNIT' : '◈ HERO UNIT';
        document.getElementById('coll-di-name').textContent = card.name;
        document.getElementById('coll-di-realname').textContent = card.realName.toUpperCase();
        document.getElementById('coll-di-lore').textContent = card.lore;

        // stat bars
        _setBar('atk',  card.atk,  15);
        _setBar('def',  card.def,  15);
        _setBar('hp',   card.hp,   50);
        _setBar('cost', card.cost, 10);

        // corner colors
        panel.querySelectorAll('.corner').forEach(c => {
            c.style.borderColor = isVillain ? '#a855f7' : 'var(--j-blue)';
        });

        overlay.classList.add('open');
    }

    function _setBar(key, val, max) {
        const fill = document.getElementById(`coll-bar-${key}`);
        const valEl = document.getElementById(`coll-barval-${key}`);
        if (fill) {
            // trigger reflow so transition plays
            fill.style.width = '0%';
            requestAnimationFrame(() => {
                fill.style.width = Math.min((val / max) * 100, 100) + '%';
            });
        }
        if (valEl) valEl.textContent = val;
    }

    function _closeDetail() {
        overlay.classList.remove('open');
    }

    // filter & sort controls
    document.querySelectorAll('.coll-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.coll-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            _render();
        });
    });

    document.getElementById('coll-sort').addEventListener('change', e => {
        currentSort = e.target.value;
        _render();
    });

    document.getElementById('coll-detail-close').addEventListener('click', _closeDetail);
    overlay.addEventListener('click', e => {
        if (e.target === overlay) _closeDetail();
    });

    document.getElementById('coll-back').addEventListener('click', () => {
        window.appRouter.navigate('lobby');
    });

    _render();
}

// helper: build stat row HTML (used inside the overlay template)
function _statRow(label, key, max) {
    return `
    <div class="coll-detail-stat-row">
        <span class="coll-detail-stat-label">${label}</span>
        <div class="coll-detail-bar-track">
            <div class="coll-detail-bar-fill ${key}-bar" id="coll-bar-${key}" style="width:0%"></div>
        </div>
        <span class="coll-detail-bar-val ${key}-val" id="coll-barval-${key}">0</span>
    </div>`;
}

window.appRouter.register('collection', renderCollectionPage);

})();