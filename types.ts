
export type Category = 'Fitness' | 'Study' | 'Skill' | 'Mind' | 'Health' | 'Discipline' | 'Social';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';

export interface Log {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  difficulty: Difficulty;
  completed: boolean;
  date: string; // ISO format
}

export interface Stat {
  subject: string;
  value: number;
  fullMark: number;
}

export enum Rank {
  SHADOW_NOVICE = 'Shadow Novice',
  SHADOW_WARRIOR = 'Shadow Warrior',
  MONARCH_CANDIDATE = 'Monarch Candidate',
  ETERNAL_MONARCH = 'Eternal Monarch'
}

export interface AIQuest {
  id: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  statAffected: string;
  completed: boolean;
}

export interface UserStats {
  strength: number;
  endurance: number;
  intelligence: number;
  focus: number;
  discipline: number;
  dexterity: number;
  relationship: number;
}

export interface Progression {
  level: number;
  xp: number;
  xpToNext: number;
  rank: Rank;
}

export interface Interruption {
  id: string;
  type: 'QUIZ' | 'EMERGENCY_TASK';
  title: string;
  content: string;
  options?: string[];
  correctAnswerIndex?: number;
  xpReward: number;
  statAffected: keyof UserStats;
}
