/**
 * Class representing the card management and dealing logic.
 */
class Cards {
    constructor() {
        /** @type {Array<Object>} */
        this.ALL_HEROES = [
            { id: 'thor',       name: 'Thor',          alias: 'Thor Odinson',      atk: 10, def: 6, cost: 7, hp: 12, art: 'art-thor' },
            { id: 'cap',        name: 'Captain America', alias: 'Steve Rogers',    atk: 7,  def: 8, cost: 5, hp: 10, art: 'art-cap' },
            { id: 'hulk',       name: 'Hulk',          alias: 'Bruce Banner',      atk: 11, def: 4, cost: 7, hp: 15, art: 'art-hulk' },
            { id: 'strange',    name: 'Doctor Strange', alias: 'Stephen Strange',   atk: 9,  def: 6, cost: 6, hp: 13, art: 'art-strange' },
            { id: 'spiderman',  name: 'Spider-Man',    alias: 'Peter Parker',      atk: 7,  def: 8, cost: 5, hp: 9,  art: 'art-spiderman' },
            { id: 'widow',      name: 'Black Widow',    alias: 'Natasha Romanoff',  atk: 6,  def: 5, cost: 4, hp: 11, art: 'art-widow' },
            { id: 'panther',    name: 'Black Panther',  alias: "T'Challa",          atk: 8,  def: 7, cost: 6, hp: 11, art: 'art-panther' },
            { id: 'hawkeye',    name: 'Hawkeye',        alias: 'Clint Barton',      atk: 7,  def: 3, cost: 3, hp: 8,  art: 'art-hawkeye' },
            { id: 'antman',     name: 'Ant-Man',        alias: 'Scott Lang',        atk: 6,  def: 6, cost: 4, hp: 9,  art: 'art-antman' },
            { id: 'wanda',      name: 'Scarlet Witch',  alias: 'Wanda Maximoff',    atk: 10, def: 4, cost: 6, hp: 11, art: 'art-wanda' },
            { id: 'vision',     name: 'Vision',         alias: 'Vision',            atk: 8,  def: 7, cost: 6, hp: 12, art: 'art-vision' },
            { id: 'bucky',      name: 'Winter Soldier', alias: 'Bucky Barnes',      atk: 8,  def: 5, cost: 5, hp: 10, art: 'art-bucky' },
            { id: 'falcon',     name: 'Falcon',         alias: 'Sam Wilson',        atk: 6,  def: 5, cost: 4, hp: 9,  art: 'art-falcon' },
            { id: 'warmachine', name: 'War Machine',    alias: 'James Rhodes',      atk: 8,  def: 6, cost: 5, hp: 10, art: 'art-warmachine' },
        ];

        /** @type {Array<Object>} */
        this.ALL_VILLAINS = [
            { id: 'thanos',      name: 'Thanos',        alias: 'Thanos',            atk: 10, def: 5, cost: 7, hp: 15, art: 'art-thanos' },
            { id: 'loki',        name: 'Loki',          alias: 'Loki Laufeyson',    atk: 7,  def: 6, cost: 5, hp: 10, art: 'art-loki' },
            { id: 'ultron',      name: 'Ultron',        alias: 'Ultron',            atk: 7,  def: 7, cost: 6, hp: 12, art: 'art-ultron' },
            { id: 'hela',        name: 'Hela',          alias: 'Hela Odinsdottir',  atk: 9,  def: 7, cost: 7, hp: 12, art: 'art-hela' },
            { id: 'magneto',     name: 'Magneto',       alias: 'Erik Lehnsherr',    atk: 9,  def: 5, cost: 6, hp: 11, art: 'art-magneto' },
            { id: 'venom',       name: 'Venom',         alias: 'Eddie Brock',       atk: 9,  def: 6, cost: 6, hp: 11, art: 'art-venom' },
            { id: 'redskull',    name: 'Red Skull',     alias: 'Johann Schmidt',    atk: 8,  def: 7, cost: 5, hp: 10, art: 'art-redskull' },
            { id: 'modok',       name: 'M.O.D.O.K.',    alias: 'George Tarleton',   atk: 7,  def: 5, cost: 4, hp: 9,  art: 'art-modok' },
            { id: 'crossbones',  name: 'Crossbones',    alias: 'Brock Rumlow',      atk: 6,  def: 4, cost: 3, hp: 8,  art: 'art-crossbones' },
            { id: 'dormammu',    name: 'Dormammu',      alias: 'Dormammu',          atk: 10, def: 5, cost: 6, hp: 13, art: 'art-dormammu' },
            { id: 'taskmaster',  name: 'Taskmaster',    alias: 'Tony Masters',      atk: 7,  def: 4, cost: 4, hp: 11, art: 'art-taskmaster' },
            { id: 'abomination', name: 'Abomination',   alias: 'Emil Blonsky',      atk: 9,  def: 6, cost: 6, hp: 12, art: 'art-abomination' },
            { id: 'whiplash',    name: 'Whiplash',      alias: 'Ivan Vanko',        atk: 9,  def: 5, cost: 5, hp: 10, art: 'art-whiplash' },
            { id: 'ronan',       name: 'Ronan',         alias: 'Ronan the Accuser', atk: 8,  def: 7, cost: 5, hp: 9,  art: 'art-ronan' },
            { id: 'goblin',      name: 'Green Goblin',  alias: 'Norman Osborn',     atk: 7,  def: 4, cost: 4, hp: 9,  art: 'art-goblin' },
        ];
    }

    /**
     * Internal helper to select the card pool based on player faction side.
     * @param {string} side - The player faction side ('hero' or 'villain').
     * @returns {Array<Object>} The array containing raw card objects.
     * @private
     */
    _pool(side) { 
        return side === 'hero' ? this.ALL_HEROES : this.ALL_VILLAINS; 
    }

    /**
     * Deals a number of randomized card instances while filtering out already used card IDs.
     * @param {number} n - Number of cards to deal.
     * @param {string} side - The faction side ('hero' or 'villain').
     * @param {Array<string>} usedIds - IDs of cards that have already been drawn.
     * @returns {Array<Object>} Array of unique initialized card instances.
     */
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