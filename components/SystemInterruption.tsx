
import React, { useState } from 'react';
import { Interruption } from '../types';
import { ShieldAlert, BrainCircuit, Timer, CheckCircle2, XCircle } from 'lucide-react';

interface SystemInterruptionProps {
  interruption: Interruption;
  onResult: (success: boolean) => void;
}

const SystemInterruption: React.FC<SystemInterruptionProps> = ({ interruption, onResult }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleQuizSubmit = (index: number) => {
    if (hasSubmitted) return;
    const correct = index === interruption.correctAnswerIndex;
    setIsCorrect(correct);
    setHasSubmitted(true);
    setTimeout(() => onResult(correct), 1500);
  };

  const handleTaskComplete = () => {
    onResult(true);
  };

  const handleTaskFail = () => {
    onResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md border-2 border-red-500/50 bg-zinc-950 p-6 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 blur-[80px] rounded-full"></div>
        
        <div className="flex items-center gap-3 mb-6">
          {interruption.type === 'QUIZ' ? (
            <BrainCircuit className="text-red-500" size={24} />
          ) : (
            <ShieldAlert className="text-red-500" size={24} />
          )}
          <div className="flex flex-col">
            <span className="text-[10px] mono font-bold text-red-500 uppercase tracking-widest animate-pulse">Critical Interruption</span>
            <h2 className="text-lg font-black mono uppercase tracking-tighter text-zinc-100">{interruption.title}</h2>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-zinc-300 leading-relaxed font-medium bg-zinc-900/50 p-3 border border-zinc-800 rounded">
            {interruption.content}
          </p>

          {interruption.type === 'QUIZ' && interruption.options && (
            <div className="grid grid-cols-1 gap-2">
              {interruption.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={hasSubmitted}
                  onClick={() => handleQuizSubmit(i)}
                  className={`w-full text-left p-3 rounded text-sm mono transition-all border ${
                    hasSubmitted && i === interruption.correctAnswerIndex 
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : hasSubmitted && i === selectedOption && !isCorrect
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-zinc-800 bg-black hover:border-red-500/50 text-zinc-400'
                  }`}
                >
                  <span className="mr-2 opacity-50">[{i}]</span> {opt}
                </button>
              ))}
            </div>
          )}

          {interruption.type === 'EMERGENCY_TASK' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mono bg-zinc-900 p-2 rounded">
                <Timer size={14} />
                <span>REQUIRE IMMEDIATE EXECUTION. NO STAT DECAY IF COMPLETED.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleTaskComplete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-xs mono uppercase tracking-widest shadow-lg shadow-red-900/20"
                >
                  Confirm Execution
                </button>
                <button
                  onClick={handleTaskFail}
                  className="px-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border border-zinc-800 rounded text-[10px] mono uppercase"
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase mono">Potential Rewards</span>
            <span className="text-xs text-green-400 mono">+{interruption.xpReward} XP / +{interruption.statAffected}</span>
          </div>
          <div className="text-[9px] mono text-zinc-600">ID: {interruption.id.slice(0,8)}</div>
        </div>

        {hasSubmitted && (
          <div className={`absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300`}>
            {isCorrect ? (
              <div className="text-center">
                <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
                <span className="text-xl font-black mono text-green-500 uppercase">Synchronized</span>
              </div>
            ) : (
              <div className="text-center">
                <XCircle size={60} className="text-red-500 mx-auto mb-4" />
                <span className="text-xl font-black mono text-red-500 uppercase">System Error</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemInterruption;
