
import React, { useState, useEffect } from 'react';
import { Category, Difficulty, Log } from '../types';
import { CATEGORIES, DIFFICULTIES, CATEGORY_STAT_MAP, CATEGORY_COLORS, DEFAULT_CATEGORY_UNITS } from '../constants';
import { db } from '../services/db';
import { Plus, X, ChevronRight, Activity, Save } from 'lucide-react';

interface LogFormProps {
  onAdd: (log: Omit<Log, 'id' | 'date' | 'completed'>) => void;
  onClose: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(DEFAULT_CATEGORY_UNITS[CATEGORIES[0]]);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [unitPrefs, setUnitPrefs] = useState<Record<string, string>>({});

  // Load user preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      const prefs = await db.getUnitPreferences();
      setUnitPrefs(prefs);
      setUnit(prefs[category] || DEFAULT_CATEGORY_UNITS[category]);
    };
    loadPrefs();
  }, [category]);

  const handleSaveDefaultUnit = async () => {
    if (!unit.trim()) return;
    await db.saveUnitPreference(category, unit);
    setUnitPrefs(prev => ({ ...prev, [category]: unit }));
    if ('vibrate' in navigator) navigator.vibrate(20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, category, quantity, unit, difficulty });
    setName('');
    onClose();
  };

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
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1">Achievement Label</label>
            <input
              autoFocus
              type="text"
              placeholder="e.g., Morning Training Session"
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-xl font-bold focus:border-violet-500 outline-none placeholder:text-zinc-800 text-zinc-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Category Neural Map Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-zinc-600 mono ml-1 flex items-center gap-2">
              <Activity size={12} /> Neural Stat Connection
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex flex-col p-3 rounded-lg border transition-all text-left ${
                    category === cat 
                    ? `${CATEGORY_COLORS[cat]} ring-1 ring-violet-500/50 scale-[1.02]` 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-[11px] font-black mono uppercase tracking-tighter">{cat}</span>
                  <span className="text-[8px] opacity-70 mt-0.5 mono">
                    {CATEGORY_STAT_MAP[cat].map(s => `+${s.toUpperCase()}`)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Metrics & Difficulty Grid */}
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase text-zinc-600 mono">Quantity & Unit</label>
                <button 
                  type="button"
                  onClick={handleSaveDefaultUnit}
                  className="text-[9px] text-zinc-500 hover:text-violet-400 flex items-center gap-1 mono uppercase"
                  title="Save as default unit for this category"
                >
                  <Save size={10} /> Set Default
                </button>
              </div>
              <div className="flex">
                <input
                  type="number"
                  className="w-1/2 bg-zinc-900 border border-zinc-800 p-3 rounded-l-lg text-xs mono outline-none focus:ring-1 ring-violet-500 text-zinc-300"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <input
                  type="text"
                  placeholder="unit"
                  className="w-1/2 bg-zinc-800 border-y border-r border-zinc-800 p-3 rounded-r-lg text-[10px] mono outline-none text-zinc-400 focus:text-zinc-100"
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
            <p className="text-[9px] text-zinc-700 text-center mt-6 mono uppercase leading-loose">
              System Alert: Growth is strictly proportional to recorded effort. <br/> False logging causes neural misalignment.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogForm;
