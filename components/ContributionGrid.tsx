
import React from 'react';
import { Log } from '../types';

interface ContributionGridProps {
  logs: Log[];
}

const ContributionGrid: React.FC<ContributionGridProps> = ({ logs }) => {
  // Generate 52 weeks of 7 days
  const today = new Date();
  const weeks = 53;
  const days = 7;
  
  const activityMap = logs.reduce((acc, log) => {
    if (!log.completed) return acc;
    const date = log.date.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const grid = [];
  for (let i = 0; i < weeks; i++) {
    const week = [];
    for (let j = 0; j < days; j++) {
      const dayOffset = (weeks - 1 - i) * 7 + (days - 1 - j);
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      const dateStr = date.toISOString().split('T')[0];
      const intensity = activityMap[dateStr] || 0;
      
      week.push({
        date: dateStr,
        intensity: intensity
      });
    }
    grid.push(week.reverse());
  }

  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-zinc-900';
    if (count < 2) return 'bg-violet-900/40';
    if (count < 4) return 'bg-violet-700/60';
    if (count < 6) return 'bg-violet-500/80 shadow-[0_0_5px_rgba(139,92,246,0.5)]';
    return 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]';
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black italic mono text-zinc-100">{logs.length}</span>
          <span className="text-[10px] text-zinc-500 mono uppercase tracking-widest">cycles in the last year</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 mono font-bold">
          <div className="flex items-center gap-1.5">
            <span>Total Active:</span>
            <span className="text-zinc-300">364</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Max Streak:</span>
            <span className="text-violet-400">284</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 shrink-0">
            {week.map((day, di) => (
              <div 
                key={di}
                title={`${day.date}: ${day.intensity} logs`}
                className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-500 ${getIntensityColor(day.intensity)}`}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-2 text-[8px] mono text-zinc-700 font-bold uppercase tracking-widest">
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
        <span>Nov</span>
        <span>Dec</span>
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
      </div>
    </div>
  );
};

export default ContributionGrid;
