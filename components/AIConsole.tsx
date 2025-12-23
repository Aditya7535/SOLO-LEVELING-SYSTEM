
import React, { useState, useRef, useEffect } from 'react';
import { getSystemAnalysis } from '../services/aiService';
import { Log, UserStats } from '../types';

interface AIConsoleProps {
  logs: Log[];
  stats: UserStats;
}

const AIConsole: React.FC<AIConsoleProps> = ({ logs, stats }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'system'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query;
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await getSystemAnalysis(userMsg, logs, stats);
    setHistory(prev => [...prev, { role: 'system', text: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[400px] bg-black border border-zinc-800 rounded-lg overflow-hidden">
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
        <span className="text-[10px] font-bold mono text-zinc-400">MONARCH_OS // SYSTEM_INTELLIGENCE_v4.2</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {history.length === 0 && (
          <p className="text-zinc-600 text-[10px] mono uppercase">No active communication session. Waiting for input...</p>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] mono text-zinc-500 mb-1">{msg.role === 'user' ? '> USER_INPUT' : '> SYSTEM_RESP'}</span>
            <div className={`max-w-[85%] p-3 rounded text-sm ${
              msg.role === 'user' ? 'bg-zinc-800 text-zinc-200' : 'bg-violet-950/20 border border-violet-900/50 text-violet-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="animate-pulse text-zinc-500 text-[10px] mono">ANALYZING LOG PATTERNS...</div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-zinc-800 bg-zinc-900">
        <input
          type="text"
          className="w-full bg-black border border-zinc-800 p-2 text-xs mono text-violet-400 focus:outline-none focus:border-violet-600"
          placeholder="ENTER SYSTEM QUERY (e.g. 'Show my stats summary')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  );
};

export default AIConsole;
