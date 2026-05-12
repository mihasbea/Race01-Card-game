const BattleRepository = require('../repositories/BattleRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class BattleService {
    async getRecentMatches(userId, limit = 10) {
        try {
            const battles = await BattleRepository.getRecentMatches(userId, limit);

            let formattedBattles = battles.map(battle => ({
                result: battle.result === 'win' ? 'win' : 'loss',
                opponent: battle.user1Id === userId ? battle.user2Username : battle.user1Username,
                unitsDeployed: battle.unitsDeployed,
                turns: battle.turns,
                battleAgo: battle.battleTime
            }));

            return formattedBattles;
        }
        catch (err) {
            console.error('Error in BattleService.getRecentMatches:', err);
            throw err;
        }
    }
}

module.exports = new BattleService();