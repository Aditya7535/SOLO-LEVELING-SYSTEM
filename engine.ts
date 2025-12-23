
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

  // Streak & Active Days Calculation
  const uniqueDates = Array.from(new Set(completedLogs.map(l => l.date.split('T')[0]))).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates.length > 0) {
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i > 0) {
        const d1 = new Date(uniqueDates[i-1]);
        const d2 = new Date(uniqueDates[i]);
        const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    const lastDate = uniqueDates[uniqueDates.length - 1];
    if (lastDate === today || lastDate === yesterday) {
      // Find current active streak
      let cur = 0;
      let checkDate = new Date(lastDate);
      for(let i = uniqueDates.length - 1; i >= 0; i--) {
        const d = new Date(uniqueDates[i]);
        const diff = (checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1) {
          cur++;
          checkDate = d;
        } else {
          break;
        }
      }
      currentStreak = cur;
    }
  }

  return {
    level,
    xp: Math.floor(totalXP),
    xpToNext: xpRequired,
    rank: rankInfo.rank,
    streak: currentStreak,
    maxStreak: maxStreak,
    activeDays: uniqueDates.length,
    totalLogs: completedLogs.length
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

  const completionRate = logs.length > 0 ? (completedLogs.length / logs.length) * 100 : 0;
  stats.discipline = Math.floor(stats.discipline + completionRate);

  return stats;
};
