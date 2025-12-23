
import { Log, AIQuest, UserStats, Category } from '../types';

/**
 * Monarch DB Service - Unified Storage Layer
 * Simulated async behavior for professional 'Cloud Sync' feel.
 */
class MonarchDatabase {
  private static STORAGE_KEYS = {
    LOGS: 'monarch_logs',
    QUESTS: 'monarch_quests',
    STATS: 'monarch_stats',
    UNIT_PREFS: 'monarch_unit_prefs'
  };

  private simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  }

  async saveLogs(logs: Log[]): Promise<void> {
    await this.simulateLatency();
    localStorage.setItem(MonarchDatabase.STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  async getLogs(): Promise<Log[]> {
    await this.simulateLatency();
    const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [];
  }

  async saveQuests(quests: AIQuest[]): Promise<void> {
    await this.simulateLatency();
    localStorage.setItem(MonarchDatabase.STORAGE_KEYS.QUESTS, JSON.stringify(quests));
  }

  async getQuests(): Promise<AIQuest[]> {
    await this.simulateLatency();
    const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.QUESTS);
    return saved ? JSON.parse(saved) : [];
  }

  async saveUnitPreference(category: Category, unit: string): Promise<void> {
    const prefs = await this.getUnitPreferences();
    prefs[category] = unit;
    localStorage.setItem(MonarchDatabase.STORAGE_KEYS.UNIT_PREFS, JSON.stringify(prefs));
  }

  async getUnitPreferences(): Promise<Record<string, string>> {
    const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.UNIT_PREFS);
    return saved ? JSON.parse(saved) : {};
  }
}

export const db = new MonarchDatabase();
