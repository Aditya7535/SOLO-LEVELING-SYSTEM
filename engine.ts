
import { Log, UserStats, Progression, Rank } from './types';
import { DIFFICULTY_MULTIPLIERS, CATEGORY_STAT_MAP, BASE_XP_PER_LOG, RANK_THRESHOLDS } from './constants';

export const calculateProgression = (logs: Log[]): Progression => {
  const completedLogs = logs.filter(l => l.completed);
  
  let totalXP = completedLogs.reduce((acc, log) => {
    const mult = DIFFICULTY_MULTIPLIERS[log.difficulty];
    const logXP = BASE_XP_PER_LOG * mult * (Math.log10(log.quantity + 1) + 1);
    return acc + logXP;
  }, 0);

  let level = 1;
  let xpRequired = 100;
  
  while (totalXP >= xpRequired) {
    totalXP -= xpRequired;
    level++;
    xpRequired = Math.floor(100 * Math.pow(level, 1.5));
  }

  const rankInfo = RANK_THRESHOLDS.slice().reverse().find(t => level >= t.level) || RANK_THRESHOLDS[0];

  return {
    level,
    xp: Math.floor(totalXP),
    xpToNext: xpRequired,
    rank: rankInfo.rank
  };
};

export const calculateStats = (logs: Log[]): UserStats => {
  const stats: UserStats = {
    strength: 0,
    endurance: 0,
    intelligence: 0,
    focus: 0,
    discipline: 0,
    dexterity: 0,
    relationship: 0
  };

  const completedLogs = logs.filter(l => l.completed);

  completedLogs.forEach(log => {
    const affectedStats = CATEGORY_STAT_MAP[log.category];
    const multiplier = DIFFICULTY_MULTIPLIERS[log.difficulty];
    const increase = (log.quantity / 10) * multiplier;

    affectedStats.forEach(s => {
      if (s in stats) {
        (stats as any)[s] += increase;
      }
    });
  });

  // Discipline is special: influenced by total completed vs total logs
  const completionRate = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;
  stats.discipline = Math.floor(stats.discipline + completionRate);

  return stats;
};
