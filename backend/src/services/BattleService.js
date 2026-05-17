const BattleRepository = require('../repositories/BattleRepository');
const UserRepository = require('../repositories/UserRepository');
const Battle = require('../entities/Battle');

class BattleService {
    /**
     * Retrieves a list of recent matches for a specific user, 
     * formatting the data to clearly show the opponent's name from the user's perspective.
     * @param {number|string} userId - The ID of the user requesting the history.
     * @param {number} [limit=10] - The maximum number of recent matches to fetch.
     * @returns {Promise<Array<Object>>} A formatted array of recent match objects.
     */
    async getRecentMatches(userId, limit = 10) {
        try {
            const battles = await BattleRepository.getRecentMatches(userId, limit);

            return battles.map(battle => {
                const u1Id = battle.user1_id !== undefined ? battle.user1_id : battle.user1Id;
                const u2Id = battle.user2_id !== undefined ? battle.user2_id : battle.user2Id;
                const winnerId = battle.winner_id !== undefined ? battle.winner_id : battle.winnerId;

                const isUser1 = Number(u1Id) === Number(userId);
                
                let finalResult = 'loss';
                if (Number(winnerId) === Number(userId)) {
                    finalResult = 'win';
                } else if (!winnerId) {
                    finalResult = 'draw';
                }

                return {
                    result: finalResult,
                    opponent: isUser1 ? battle.user2Username : battle.user1Username,
                    unitsDeployed: battle.units_deployed || battle.unitsDeployed,
                    turns: battle.turns,
                    timeAgo: battle.battle_time || battle.battleTime
                };
            });
        }
        catch (err) {
            console.error('Error in BattleService.getRecentMatches:', err);
            throw err;
        }
    }

    /**
     * Saves a battle result to history and automatically updates statistics 
     * (wins, losses, winrate) and distributes coin rewards for both participants.
     * @param {Object} battleResults - Outcome data of the completed match.
     * @param {number|string} battleResults.p1Id - ID of Player 1.
     * @param {number|string} battleResults.p2Id - ID of Player 2.
     * @param {number|string} battleResults.winnerId - ID of the player who won the match.
     * @param {number} battleResults.turns - Total number of turns the match lasted.
     * @param {number} battleResults.unitsDeployed - Total number of units deployed during the battle.
     * @returns {Promise<void>}
     */
    async saveBattleResult({ p1Id, p2Id, winnerId, turns, unitsDeployed }) {
        try {
            const battleData = new Battle({
                battleTime: new Date(),
                unitsDeployed: unitsDeployed,
                turns: turns,
                user1Id: p1Id,
                user2Id: p2Id,
                winnerId: winnerId
            });

            await BattleRepository.save(battleData);

            const players = [p1Id, p2Id];
            for (const userId of players) {
                const user = await UserRepository.findOne('id', userId);
                if (!user) continue;

                const isWinner = Number(userId) === Number(winnerId);
                const newWins = isWinner ? (user.wins || 0) + 1 : (user.wins || 0);
                const newLost = !isWinner ? (user.lost || 0) + 1 : (user.lost || 0);
                const totalGames = newWins + newLost;
                const newWinrate = totalGames > 0 ? Math.round((newWins / totalGames) * 100) : 0;
                
                const currentCoins = user.coins || 0;
                // Нарахування: +50 монет за перемогу, +10 монет за поразку
                const newCoins = isWinner ? currentCoins + 50 : currentCoins + 10;

                await UserRepository.update(userId, {
                    wins: newWins,
                    lost: newLost,
                    winrate: newWinrate,
                    coins: newCoins
                });
            }

                console.log(`[BattleService] Match successfully saved. Winner: ${winnerId}`);
        } catch (err) {
            console.error('Error in saveBattleResult:', err);
        }
    }
}

module.exports = new BattleService();