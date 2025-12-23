
import React, { useState, useEffect } from 'react';
import { Category, Difficulty, Log } from '../types';
import { CATEGORIES, DIFFICULTIES, CATEGORY_STAT_MAP, CATEGORY_COLORS, DEFAULT_CATEGORY_UNITS } from '../constants';
import { db } from '../services/db';
import { X, ChevronRight, Activity, Save, Zap } from 'lucide-react';

interface LogFormProps {
  onAdd: (log: Omit<Log, 'id' | 'date' | 'completed'>) => void;
  onClose: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ onAdd, onClose }) => {
  const userKey = localStorage.getItem('monarch_user_key') || '';
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(DEFAULT_CATEGORY_UNITS[CATEGORIES[0]]);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');

  useEffect(() => {
    const loadPrefs = async () => {
      if (!userKey) return;
      const prefs = await db.getUnitPreferences(userKey);
      setUnit(prefs[category] || DEFAULT_CATEGORY_UNITS[category]);
    };
    loadPrefs();
  }, [category, userKey]);

  const handleSaveDefaultUnit = async () => {
    if (!unit.trim() || !userKey) return;
    await db.saveUnitPreference(category, unit, userKey);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, category, quantity, unit, difficulty });
    onClose();
  };

  const activeStats = CATEGORY_STAT_MAP[category] || [];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl z-40 animate-in slide-in-from-right duration-300">
      <div className="p-6 h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
            <h2 className="text-sm font-bold mono uppercase tracking-widest text-zinc-400">Neural Sync Entry</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex-1">
          {/* Activity Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1">Achievement Label</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g., Heavy Duty Gym Session"
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-xl font-bold focus:border-violet-500 outline-none text-zinc-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1 flex items-center gap-2">
              Neural Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded border text-[10px] mono font-bold uppercase transition-all text-center ${
                    category === cat 
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Neural Stat Connection Display */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1 flex items-center gap-2">
              <Activity size={12} /> Neural Stat Connection
            </label>
            <div className="flex flex-wrap gap-2 min-h-[48px]">
              {activeStats.map(stat => (
                <div 
                  key={stat}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full animate-in zoom-in-95 duration-200"
                >
                  <Zap size={10} className="text-amber-400" />
                  <span className="text-[10px] font-black mono text-zinc-100 uppercase tracking-tighter">
                    +{stat}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
                </div>
              ))}
              {activeStats.length === 0 && (
                <div className="text-[10px] mono text-zinc-700 italic">No neural paths identified...</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Intensity */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1">Intensity Level</label>
              <select
                className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-xs mono outline-none focus:ring-1 ring-violet-500 text-zinc-300"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase text-zinc-600 mono">Quantity</label>
                <button 
                  type="button"
                  onClick={handleSaveDefaultUnit}
                  className="text-[9px] text-zinc-500 hover:text-violet-400 flex items-center gap-1 mono uppercase"
                >
                  <Save size={10} /> Set Default
                </button>
              </div>
              <div className="flex">
                <input
                  type="number"
                  className="w-1/2 bg-zinc-900 border border-zinc-800 p-3 rounded-l-lg text-xs mono outline-none text-zinc-300"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <input
                  type="text"
                  placeholder="unit"
                  className="w-1/2 bg-zinc-800 border-y border-r border-zinc-800 p-3 rounded-r-lg text-[10px] mono outline-none text-zinc-400"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 pb-10">
            <button 
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mono uppercase tracking-widest shadow-xl shadow-violet-900/30 active:scale-[0.98]"
            >
              Commit to Matrix <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogForm;
