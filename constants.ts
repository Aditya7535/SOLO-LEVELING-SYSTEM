
import { Difficulty, Category, Rank } from './types';

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 4,
  INSANE: 8
};

export const CATEGORY_STAT_MAP: Record<Category, string[]> = {
  Fitness: ['strength', 'endurance'],
  Study: ['intelligence'],
  Skill: ['dexterity'],
  Mind: ['focus'],
  Health: ['endurance'],
  Discipline: ['discipline'],
  Social: ['relationship']
};

export const CATEGORY_COLORS: Record<Category, string> = {
  Fitness: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
  Study: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
  Skill: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
  Mind: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50',
  Health: 'bg-rose-900/30 text-rose-400 border-rose-800/50',
  Discipline: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  Social: 'bg-pink-900/30 text-pink-400 border-pink-800/50'
};

export const RANK_THRESHOLDS = [
  { level: 0, rank: Rank.SHADOW_NOVICE },
  { level: 20, rank: Rank.SHADOW_WARRIOR },
  { level: 50, rank: Rank.MONARCH_CANDIDATE },
  { level: 100, rank: Rank.ETERNAL_MONARCH }
];

export const CATEGORIES: Category[] = ['Fitness', 'Study', 'Skill', 'Mind', 'Health', 'Discipline', 'Social'];
export const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'INSANE'];

export const BASE_XP_PER_LOG = 10;
