
export type Category = 'Strength' | 'Endurance' | 'Intelligence' | 'Focus' | 'Discipline' | 'Dexterity' | 'Relationship';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'INSANE';

export interface User {
  email: string;
  password?: string; // Only stored in mock DB
  createdAt: string;
}

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
  streak: number;
  maxStreak: number;
  activeDays: number;
  totalLogs: number;
}

export interface Achievement {
  id: string;
  name: string; 
  label: string; 
  description: string;
  iconType: 'TEMPORAL' | 'STREAK' | 'ATTRIBUTE';
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  dateEarned: string;
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
