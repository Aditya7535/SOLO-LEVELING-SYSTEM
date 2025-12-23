
import React from 'react';
import { Log, Difficulty, Achievement } from '../types';
import { ChevronRight, Award } from 'lucide-react';

interface ComplexityBreakdownProps {
  logs: Log[];
  totalLogs: number;
  achievements: Achievement[];
}

const ComplexityBreakdown: React.FC<ComplexityBreakdownProps> = ({ logs, totalLogs, achievements }) => {
  const counts = logs.reduce((acc, log) => {
    if (log.completed) {
      acc[log.difficulty] = (acc[log.difficulty] || 0) + 1;
    }
    return acc;
  }, {} as Record<Difficulty, number>);

  const tiers = [
    { label: 'Easy', key: 'EASY' as Difficulty, color: 'bg-emerald-500', total: 700 },
    { label: 'Medium', key: 'MEDIUM' as Difficulty, color: 'bg-amber-500', total: 1485 },
    { label: 'Hard', key: 'HARD' as Difficulty, color: 'bg-red-500', total: 616 },
    { label: 'Insane', key: 'INSANE' as Difficulty, color: 'bg-violet-500', total: 100 }
  ];

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(3000, totalLogs) / 3000) * circumference;

  // Sorting achievements to show latest first
  const latestAchievement = achievements[achievements.length - 1];
  const displayedAchievements = achievements.slice(-3).reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] text-zinc-500 mono font-black uppercase tracking-widest">Solved Problems</h3>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="7" fill="transparent" className="text-zinc-900" />
              <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="7" fill="transparent" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" className="text-amber-500 transition-all duration-1000" style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.4))' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black mono text-zinc-100 leading-none">{totalLogs}</span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase mono tracking-tighter mt-1">Solved</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {tiers.map(tier => {
              const count = counts[tier.key] || 0;
              const percentage = (count / tier.total) * 100;
              return (
                <div key={tier.label} className="space-y-1">
                  <div className="flex justify-between text-[9px] mono font-bold items-baseline">
                    <span className="text-zinc-500">{tier.label}</span>
                    <div className="flex gap-1 items-baseline">
                      <span className="text-zinc-100">{count}</span>
                      <span className="text-zinc-700">/{tier.total}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div className={`h-full ${tier.color} transition-all duration-1000 rounded-full`} style={{ width: `${Math.min(100, percentage)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 relative flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <h3 className="text-[10px] text-zinc-500 mono font-black uppercase tracking-widest">Badges Earned</h3>
            <span className="text-2xl font-black text-zinc-100 mono">{achievements.length}</span>
          </div>
          <button className="p-1 hover:bg-zinc-900 rounded transition-colors text-zinc-600 hover:text-zinc-400">
             <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          {displayedAchievements.length > 0 ? (
            displayedAchievements.map((ach, idx) => (
              <BadgeIcon 
                key={ach.id} 
                tier={ach.tier} 
                label={ach.label} 
                active={idx === 0} 
              />
            ))
          ) : (
            <div className="flex-1 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center p-4">
              <span className="text-[8px] mono text-zinc-700 uppercase">Awaiting Achievement...</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1 mt-auto">
           <span className="text-[8px] text-zinc-600 mono font-bold uppercase">Latest Achievement</span>
           {latestAchievement ? (
             <div className="flex items-start gap-2">
               <Award size={12} className="text-violet-400 mt-0.5" />
               <div>
                 <p className="text-xs font-bold text-zinc-100 mono italic uppercase tracking-tighter">{latestAchievement.name}</p>
                 <p className="text-[8px] text-zinc-500 mono uppercase">{latestAchievement.description}</p>
               </div>
             </div>
           ) : (
             <p className="text-[10px] text-zinc-700 mono italic uppercase">Neural link establishing...</p>
           )}
        </div>
      </div>
    </div>
  );
};

// Use React.FC to properly handle standard props like 'key' when used in a map function
const BadgeIcon: React.FC<{ tier: Achievement['tier']; label: string; active?: boolean }> = ({ tier, label, active = false }) => {
  const colors = {
    BRONZE: 'text-amber-700 border-amber-800',
    SILVER: 'text-zinc-300 border-zinc-400',
    GOLD: 'text-yellow-400 border-yellow-500',
    PLATINUM: 'text-violet-400 border-violet-500',
  };

  const glow = active ? {
    BRONZE: 'shadow-[0_0_15px_rgba(180,83,9,0.2)]',
    SILVER: 'shadow-[0_0_15px_rgba(212,212,216,0.2)]',
    GOLD: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
    PLATINUM: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]',
  }[tier] : '';

  return (
    <div className={`relative w-12 h-14 flex flex-col items-center justify-center bg-zinc-900 border ${active ? colors[tier] : 'border-zinc-800'} rounded-lg transition-all hover:-translate-y-1 cursor-pointer group ${glow}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black mb-1 flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors">
          <div className={`w-3 h-3 rounded-sm rotate-45 border ${colors[tier]} bg-black/50`}></div>
      </div>
      <span className="text-[5px] text-zinc-500 mono font-black uppercase text-center leading-tight px-1">{label}</span>
    </div>
  );
};

export default ComplexityBreakdown;
