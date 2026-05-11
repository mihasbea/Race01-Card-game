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
    constructor({ battle_time, units_deployed, turns, user1_id, user2_id, winner_id }) {
        this.#battleTime = battle_time || new Date();
        this.#unitsDeployed = Number(units_deployed) || 0;
        this.#turns = Number(turns) || 0;
        this.#user1Id = user1_id;
        this.#user2Id = user2_id;
        this.#winnerId = winner_id;
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