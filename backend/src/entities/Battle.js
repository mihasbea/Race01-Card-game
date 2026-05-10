class Battle {
    #battleTime;
    #unitsDeployed;
    #turns;
    #user1;
    #user2;
    #winner;

    constructor(battleTime, unitsDeployed, turns, user1, user2, winner) {
        this.#battleTime = battleTime;
        this.#unitsDeployed = unitsDeployed;
        this.#turns = turns;
        this.#user1 = user1;
        this.#user2 = user2;
        this.#winner = winner;
    }
}

module.exports = Battle;