class Battle {
    #battleTime;
    #unitsDeployed;
    #turns;
    #user1Id;
    #user2Id;
    #winnerId;

    /**
     * @param {Object} data - Battle data object
     */
    constructor(data) {
        this.#battleTime    = data.battleTime    ?? data.battle_time    ?? new Date();
        this.#unitsDeployed = Number(data.unitsDeployed ?? data.units_deployed) || 0;
        this.#turns         = Number(data.turns) || 0;
        this.#user1Id       = data.user1Id       ?? data.user1_id;
        this.#user2Id       = data.user2Id       ?? data.user2_id;
        this.#winnerId      = data.winnerId      ?? data.winner_id;
    }

    // GETTERS
    get battleTime() { return this.#battleTime; }
    get unitsDeployed() { return this.#unitsDeployed; }
    get turns() { return this.#turns; }
    get user1Id() { return this.#user1Id; }
    get user2Id() { return this.#user2Id; }
    get winnerId() { return this.#winnerId; }

    /**
     * Checks if the battle was a draw
     * @returns {boolean}
     */
    isDraw() {
        return this.#winnerId === null || this.#winnerId === undefined;
    }

    /**
     * Converts battle record to a plain object for database or API
     */
    toJSON() {
        return {
            battleTime: this.#battleTime,
            unitsDeployed: this.#unitsDeployed,
            turns: this.#turns,
            user1Id: this.#user1Id,
            user2Id: this.#user2Id,
            winnerId: this.#winnerId,
            isDraw: this.isDraw()
        };
    }
}

module.exports = Battle;