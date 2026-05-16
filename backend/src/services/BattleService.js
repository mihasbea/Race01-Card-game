    const BattleRepository = require('../repositories/BattleRepository');
    const Battle = require('../entities/Battle');
    const UserRepository = require('../repositories/UserRepository');

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