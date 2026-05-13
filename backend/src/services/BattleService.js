const BattleRepository = require('../repositories/BattleRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class BattleService {
    async getRecentMatches(userId, limit = 10) {
        try {
            const battles = await BattleRepository.getRecentMatches(userId, limit);

            return battles.map(battle => {
                const isUser1 = Number(battle.user1_id) === Number(userId);
                
                return {
                    result: battle.result,
                    opponent: isUser1 ? battle.user2Username : battle.user1Username,
                    unitsDeployed: battle.units_deployed,
                    turns: battle.turns,
                    timeAgo: battle.battle_time
                };
            });
        }
        catch (err) {
            console.error('Error in BattleService.getRecentMatches:', err);
            throw err;
        }
    }
}

module.exports = new BattleService();