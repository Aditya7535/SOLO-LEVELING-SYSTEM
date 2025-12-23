
import { Log, AIQuest, Achievement, Category, User } from '../types';

class MonarchDatabase {
  private static STORAGE_KEYS = {
    USERS: 'monarch_users_registry',
    LOGS: 'monarch_logs',
    QUESTS: 'monarch_quests',
    STATS: 'monarch_stats',
    UNIT_PREFS: 'monarch_unit_prefs',
    ACHIEVEMENTS: 'monarch_achievements'
  };

  private getScopedKey(baseKey: string, email: string): string {
    // Basic sanitization of email for key usage
    const safeEmail = btoa(email);
    return `${baseKey}_${safeEmail}`;
  }

  // --- Auth Methods ---
  
  async register(email: string, password: string): Promise<User | null> {
    const users = this.getAllUsers();
    if (users.find(u => u.email === email)) return null;

    const newUser: User = {
      email,
      password, // In a real app, this would be hashed on server
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(MonarchDatabase.STORAGE_KEYS.USERS, JSON.stringify(users));
    return { email: newUser.email, createdAt: newUser.createdAt };
  }

  async login(email: string, password: string): Promise<User | null> {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    return { email: user.email, createdAt: user.createdAt };
  }

  private getAllUsers(): any[] {
    const saved = localStorage.getItem(MonarchDatabase.STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : [];
  }

  // --- Data Persistence ---

  async saveLogs(logs: Log[], email: string): Promise<void> {
    localStorage.setItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.LOGS, email), JSON.stringify(logs));
  }

  async getLogs(email: string): Promise<Log[]> {
    const saved = localStorage.getItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.LOGS, email));
    return saved ? JSON.parse(saved) : [];
  }

  async saveQuests(quests: AIQuest[], email: string): Promise<void> {
    localStorage.setItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.QUESTS, email), JSON.stringify(quests));
  }

  async getQuests(email: string): Promise<AIQuest[]> {
    const saved = localStorage.getItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.QUESTS, email));
    return saved ? JSON.parse(saved) : [];
  }

  async saveAchievements(achievements: Achievement[], email: string): Promise<void> {
    localStorage.setItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.ACHIEVEMENTS, email), JSON.stringify(achievements));
  }

  async getAchievements(email: string): Promise<Achievement[]> {
    const saved = localStorage.getItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.ACHIEVEMENTS, email));
    return saved ? JSON.parse(saved) : [];
  }

  async saveUnitPreference(category: Category, unit: string, email: string): Promise<void> {
    const prefs = await this.getUnitPreferences(email);
    prefs[category] = unit;
    localStorage.setItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.UNIT_PREFS, email), JSON.stringify(prefs));
  }

  async getUnitPreferences(email: string): Promise<Record<string, string>> {
    const saved = localStorage.getItem(this.getScopedKey(MonarchDatabase.STORAGE_KEYS.UNIT_PREFS, email));
    return saved ? JSON.parse(saved) : {};
  }
}

export const db = new MonarchDatabase();
