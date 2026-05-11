class User {
    #id;
    #fullName;
    #login;
    #email;
    #password;
    #coins;
    #wins;
    #lost;
    #winrate;
    #lvl;

    /**
     * @param {Object} data - User data object from DB or form
     */
    constructor({ id, full_name, login, email, password, coins = 0, wins = 0, lost = 0, lvl = 1 }) {
        this.#id = id;
        this.#fullName = full_name;
        this.#login = login;
        this.#email = email;
        this.#password = password;
        this.#coins = Number(coins);
        this.#wins = Number(wins);
        this.#lost = Number(lost);
        this.#lvl = Number(lvl);
        
        this.#winrate = this._calculateWinrate();
    }

    // Helper method for winrate calculation
    _calculateWinrate() {
        const totalGames = this.#wins + this.#lost;
        if (totalGames === 0) return 0;
        return parseFloat(((this.#wins / totalGames) * 100).toFixed(2)); 
    }

    // GETTERS
    get id() { return this.#id; }
    get fullName() { return this.#fullName; }
    get login() { return this.#login; }
    get email() { return this.#email; }
    get password() { return this.#password; }
    get coins() { return this.#coins; }
    get wins() { return this.#wins; }
    get lost() { return this.#lost; }
    get winrate() { return this.#winrate; }
    get lvl() { return this.#lvl; }

    /**
     * Updates stats after a match
     * @param {number} newWins - Number of new wins to add
     * @param {number} newLost - Number of new losses to add
     */
    addMatchResults(newWins, newLost) {
        this.#wins += newWins;
        this.#lost += newLost;
        this.#winrate = this._calculateWinrate();
    }

    /**
     * Converts the entity to a plain object (useful for JSON responses)
     */
    toJSON() {
        return {
            id: this.#id,
            fullName: this.#fullName,
            login: this.#login,
            email: this.#email,
            coins: this.#coins,
            wins: this.#wins,
            lost: this.#lost,
            winrate: this.#winrate,
            lvl: this.#lvl
        };
    }
}

module.exports = User;