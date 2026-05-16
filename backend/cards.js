class Cards {
    constructor() {
        this.ALL_HEROES = [
            { id: 'ironman',    name: 'IRON MAN',      alias: 'Tony Stark',        atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-ironman',    sym: '⚙' },
            { id: 'thor',       name: 'THOR',           alias: 'God of Thunder',    atk: 10, def: 3, cost: 6, hp: 12, art: 'art-thor',       sym: '⚡' },
            { id: 'cap',        name: 'CAPT. AMERICA',  alias: 'Steve Rogers',      atk: 7,  def: 9, cost: 5, hp: 14, art: 'art-cap',        sym: '★' },
            { id: 'hulk',       name: 'HULK',           alias: 'Bruce Banner',      atk: 12, def: 2, cost: 7, hp: 14, art: 'art-hulk',       sym: '💪' },
            { id: 'strange',    name: 'DR. STRANGE',    alias: 'Sorcerer Supreme',  atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-strange',    sym: '🌀' },
            { id: 'spiderman',  name: 'SPIDER-MAN',     alias: 'Peter Parker',      atk: 7,  def: 7, cost: 5, hp: 14, art: 'art-spiderman',  sym: '🕷' },
            { id: 'widow',      name: 'BLACK WIDOW',    alias: 'Nat. Romanoff',     atk: 6,  def: 6, cost: 4, hp: 8,  art: 'art-widow',      sym: '🕸' },
            { id: 'panther',    name: 'BLACK PANTHER',  alias: "T'Challa",          atk: 8,  def: 8, cost: 6, hp: 12, art: 'art-panther',    sym: '🐾' },
            { id: 'hawkeye',    name: 'HAWKEYE',        alias: 'Clint Barton',      atk: 7,  def: 4, cost: 4, hp: 8,  art: 'art-hawkeye',    sym: '🏹' },
            { id: 'antman',     name: 'ANT-MAN',        alias: 'Scott Lang',        atk: 6,  def: 5, cost: 4, hp: 8,  art: 'art-antman',     sym: '🐜' },
            { id: 'wanda',      name: 'SCARLET WITCH',  alias: 'Wanda Maximoff',    atk: 11, def: 4, cost: 7, hp: 14, art: 'art-wanda',      sym: '🔮' },
            { id: 'vision',     name: 'VISION',         alias: 'Synthezoid',        atk: 8,  def: 7, cost: 6, hp: 12, art: 'art-vision',     sym: '💎' },
            { id: 'bucky',      name: 'WINTER SOLDIER', alias: 'Bucky Barnes',      atk: 9,  def: 5, cost: 5, hp: 10, art: 'art-bucky',      sym: '🔫' },
            { id: 'falcon',     name: 'FALCON',         alias: 'Sam Wilson',        atk: 7,  def: 6, cost: 5, hp: 10, art: 'art-falcon',     sym: '🦅' },
            { id: 'warmachine', name: 'WAR MACHINE',    alias: 'James Rhodes',      atk: 9,  def: 7, cost: 7, hp: 14, art: 'art-warmachine', sym: '🔧' },
        ];

        this.ALL_VILLAINS = [
            { id: 'thanos',      name: 'THANOS',        alias: 'The Mad Titan',     atk: 13, def: 7, cost: 9, hp: 18, art: 'art-thanos',     sym: '∞' },
            { id: 'loki',        name: 'LOKI',          alias: 'God of Mischief',   atk: 6,  def: 7, cost: 5, hp: 10, art: 'art-loki',       sym: '⚗' },
            { id: 'ultron',      name: 'ULTRON',        alias: 'Genocidal AI',      atk: 9,  def: 4, cost: 6, hp: 12, art: 'art-ultron',     sym: '🤖' },
            { id: 'hela',        name: 'HELA',          alias: 'Goddess of Death',  atk: 11, def: 5, cost: 7, hp: 14, art: 'art-hela',       sym: '⚰' },
            { id: 'magneto',     name: 'MAGNETO',       alias: 'Erik Lehnsherr',    atk: 9,  def: 8, cost: 7, hp: 14, art: 'art-magneto',    sym: '🧲' },
            { id: 'venom',       name: 'VENOM',         alias: 'Eddie Brock',       atk: 10, def: 3, cost: 6, hp: 12, art: 'art-venom',      sym: '🖤' },
            { id: 'redskull',    name: 'RED SKULL',     alias: 'Johann Schmidt',    atk: 8,  def: 6, cost: 6, hp: 12, art: 'art-redskull',   sym: '💀' },
            { id: 'modok',       name: 'M.O.D.O.K.',    alias: 'Mental Organism',   atk: 10, def: 5, cost: 7, hp: 14, art: 'art-modok',      sym: '🧠' },
            { id: 'crossbones',  name: 'CROSSBONES',    alias: 'Brock Rumlow',      atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-crossbones', sym: '✖' },
            { id: 'dormammu',    name: 'DORMAMMU',      alias: 'Dark Dimension',    atk: 12, def: 6, cost: 8, hp: 16, art: 'art-dormammu',   sym: '🌑' },
            { id: 'taskmaster',  name: 'TASKMASTER',    alias: 'Tony Masters',      atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-taskmaster', sym: '🎭' },
            { id: 'abomination', name: 'ABOMINATION',   alias: 'Emil Blonsky',      atk: 11, def: 4, cost: 7, hp: 14, art: 'art-abomination',sym: '☢' },
            { id: 'whiplash',    name: 'WHIPLASH',      alias: 'Ivan Vanko',        atk: 8,  def: 4, cost: 5, hp: 10, art: 'art-whiplash',   sym: '⚡' },
            { id: 'ronan',       name: 'RONAN',         alias: 'The Accuser',       atk: 10, def: 7, cost: 7, hp: 14, art: 'art-ronan',      sym: '🔨' },
            { id: 'goblin',      name: 'GREEN GOBLIN',  alias: 'Norman Osborn',     atk: 9,  def: 5, cost: 6, hp: 12, art: 'art-goblin',     sym: '🎃' },
        ];
    }

    _pool(side) { return side === 'hero' ? this.ALL_HEROES : this.ALL_VILLAINS; }

    _deal(n, side, usedIds) {
        const usedSet = new Set(usedIds);
        const available = this._pool(side).filter(c => !usedSet.has(c.id));
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n).map((base, i) => ({
            ...base,
            currentHp: base.hp,
            instanceId: base.id + '-' + Date.now() + '-' + i,
        }));
    }
}

module.exports = new Cards();