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
    
    constructor(id, fullName, login, email, password, coins, wins, lost, lvl) {
        this.#id = id;
        this.#fullName = fullName;
        this.#login = login;
        this.#email = email;
        this.#password = password;
        this.#coins = coins;
        this.#wins = wins;
        this.#lost = lost;
        this.#lvl = lvl;

        this.#winrate = this.#wins / (this.#wins + this.#lost) * 100;
    }

    get id() {
        return this.#id;
    }

    get fullName() {
        return this.#fullName;
    }

    get login() {
        return this.#login;
    }

    get email() {
        return this.#email;
    }

    get password() {
        return this.#password;
    }

    get coins() {
        return this.#coins;
    }

    get wins() {
        return this.#wins;
    }

    get lost() {
        return this.#lost;
    }

    get winrate() {
        return this.#winrate;
    }

    get lvl() {
        return this.#lvl;
    }

    updateStats(wins, lost) {
        this.#wins += wins;
        this.#lost += lost;
        this.#winrate = this.#wins / (this.#wins + this.#lost) * 100;
    }
}

module.exports = User;