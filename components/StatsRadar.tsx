
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UserStats } from '../types';

interface StatsRadarProps {
  stats: UserStats;
}

const StatsRadar: React.FC<StatsRadarProps> = ({ stats }) => {
  const data = [
    { subject: 'Strength', A: stats.strength, fullMark: 150 },
    { subject: 'Endurance', A: stats.endurance, fullMark: 150 },
    { subject: 'Intelligence', A: stats.intelligence, fullMark: 150 },
    { subject: 'Focus', A: stats.focus, fullMark: 150 },
    { subject: 'Discipline', A: stats.discipline, fullMark: 150 },
    { subject: 'Dexterity', A: stats.dexterity, fullMark: 150 },
    { subject: 'Relationship', A: stats.relationship, fullMark: 150 },
  ];

  return (
    <div className="w-full h-64 md:h-80 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-bold mono">Neural Stat Map</h3>
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
  );
};

export default StatsRadar;
