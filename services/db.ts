
import { Log, AIQuest, UserStats } from '../types';

/**
 * Monarch DB Service
 * Current implementation: LocalStorage with Async wrappers.
 * Ready for migration to Firestore/Supabase.
 */
class MonarchDatabase {
  private static STORAGE_KEYS = {
    LOGS: 'monarch_logs',
    QUESTS: 'monarch_quests',
    STATS: 'monarch_stats'
  };

  async saveLogs(logs: Log[]): Promise<void> {
    return new Promise((resolve) => {
      localStorage.setItem(MonarchDatabase.STORAGE_KEYS.LOGS, JSON.stringify(logs));
      resolve();
    });
  }

  async getLogs(): Promise<Log[]> {
    return new Promise((resolve) => {
      const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.LOGS);
      resolve(saved ? JSON.parse(saved) : []);
    });
  }

  async saveQuests(quests: AIQuest[]): Promise<void> {
    return new Promise((resolve) => {
      localStorage.setItem(MonarchDatabase.STORAGE_KEYS.QUESTS, JSON.stringify(quests));
      resolve();
    });
  }

  async getQuests(): Promise<AIQuest[]> {
    return new Promise((resolve) => {
      const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.QUESTS);
      resolve(saved ? JSON.parse(saved) : []);
    });
  }
}

export const db = new MonarchDatabase();
