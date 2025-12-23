
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsRadarProps {
  stats: UserStats;
  trend?: 'up' | 'down' | 'stable';
}

const StatsRadar: React.FC<StatsRadarProps> = ({ stats, trend = 'stable' }) => {
  const data = [
    { subject: 'Strength', A: stats.strength, fullMark: 150 },
    { subject: 'Endurance', A: stats.endurance, fullMark: 150 },
    { subject: 'Intelligence', A: stats.intelligence, fullMark: 150 },
    { subject: 'Focus', A: stats.focus, fullMark: 150 },
    { subject: 'Discipline', A: stats.discipline, fullMark: 150 },
    { subject: 'Dexterity', A: stats.dexterity, fullMark: 150 },
    { subject: 'Relationship', A: stats.relationship, fullMark: 150 },
  ];

  const renderTrendIndicator = () => {
    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-800/50">
            <TrendingUp size={12} />
            <span className="text-[9px] font-bold mono">IMPROVING</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center gap-1 text-rose-400 bg-rose-900/20 px-2 py-0.5 rounded border border-rose-800/50">
            <TrendingDown size={12} />
            <span className="text-[9px] font-bold mono">DECAYING</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50">
            <Minus size={12} />
            <span className="text-[9px] font-bold mono">STABLE</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 min-w-0 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mono">Neural Stat Map</h3>
          <p className="text-[8px] text-zinc-600 mono mt-0.5">RELATIONSHIP_VECTOR_ANALYSIS</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] text-zinc-600 mono uppercase font-bold">Social Trend</span>
          {renderTrendIndicator()}
        </div>
      </div>
      
      <div className="w-full aspect-square md:aspect-video min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} 
            />
            <Radar
              name="Stats"
              dataKey="A"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsRadar;
