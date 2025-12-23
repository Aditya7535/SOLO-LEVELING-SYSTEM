
import React from 'react';
import { AIQuest } from '../types';

interface QuestCardProps {
  quest: AIQuest;
  onComplete: (id: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  return (
    <div className={`p-4 border border-zinc-800 rounded-lg flex flex-col gap-3 transition-all ${quest.completed ? 'opacity-50 grayscale' : 'hover:border-violet-500 bg-zinc-950/50'}`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase font-bold text-violet-400 mono">AI GENERATED QUEST</span>
        <span className={`text-[10px] px-2 py-0.5 rounded border ${
          quest.difficulty === 'INSANE' ? 'border-red-500 text-red-500' : 
          quest.difficulty === 'HARD' ? 'border-orange-500 text-orange-500' : 
          'border-zinc-500 text-zinc-500'
        } mono`}>{quest.difficulty}</span>
      </div>
      <p className="text-sm font-medium text-zinc-200">{quest.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-500 uppercase mono">Rewards</span>
          <span className="text-xs text-green-400">+{quest.xpReward} XP / +{quest.statAffected}</span>
        </div>
        <button 
          onClick={() => onComplete(quest.id)}
          disabled={quest.completed}
          className={`px-4 py-1.5 text-xs font-bold rounded uppercase mono tracking-tighter ${
            quest.completed ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-violet-900/50 text-violet-200 border border-violet-800 hover:bg-violet-800'
          }`}
        >
          {quest.completed ? 'SYNCED' : 'COMPLETE'}
        </button>
      </div>
    </div>
  );
};

export default QuestCard;
