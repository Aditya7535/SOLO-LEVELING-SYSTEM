
import React, { useState, useEffect, useMemo } from 'react';
import { Log, UserStats, Progression, AIQuest, Interruption, Category } from './types';
import { calculateProgression, calculateStats } from './engine';
import { generateQuests, generateSystemInterruption } from './services/aiService';
import { db } from './services/db';
import { CATEGORY_COLORS } from './constants';
import StatsRadar from './components/StatsRadar';
import LogForm from './components/LogForm';
import QuestCard from './components/QuestCard';
import AIConsole from './components/AIConsole';
import SystemInterruption from './components/SystemInterruption';
import { 
  LayoutDashboard, 
  FileText, 
  Target, 
  Terminal, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Search,
  Trash2,
  Clock,
  Wifi,
  Database,
  Cpu,
  ChevronRight
} from 'lucide-react';

type TimeFrame = 'today' | 'week' | 'month' | 'year';

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [quests, setQuests] = useState<AIQuest[]>([]);
  const [interruption, setInterruption] = useState<Interruption | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'quests' | 'console'>('dashboard');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const bootMessages = [
    "INITIALIZING MONARCH_KERNEL_v4.2...",
    "ESTABLISHING NEURAL_DB_LINK...",
    "MAPPING BIOMETRIC_VECTORS...",
    "SYNCING LOCAL_DATA_NODES...",
    "READY FOR LOGGING."
  ];

  // Boot Sequence
  useEffect(() => {
    if (bootStep < bootMessages.length) {
      const timer = setTimeout(() => {
        setBootStep(prev => prev + 1);
      }, 400 + Math.random() * 600);
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setIsBooting(false), 800);
    }
  }, [bootStep]);

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      setIsSyncing(true);
      const savedLogs = await db.getLogs();
      const savedQuests = await db.getQuests();
      setLogs(savedLogs);
      setQuests(savedQuests);
      setIsSyncing(false);
    };
    initData();
  }, []);

  // Persistent Sync
  useEffect(() => {
    if (logs.length > 0) db.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (quests.length > 0) db.saveQuests(quests);
  }, [quests]);

  const progression = useMemo(() => calculateProgression(logs), [logs]);

  const temporalStats = useMemo(() => {
    const now = new Date();
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      const diffInMs = now.getTime() - logDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      if (timeFrame === 'today') return diffInDays < 1;
      if (timeFrame === 'week') return diffInDays < 7;
      if (timeFrame === 'month') return diffInDays < 30;
      if (timeFrame === 'year') return diffInDays < 365;
      return true;
    });
    return calculateStats(filteredLogs);
  }, [logs, timeFrame]);

  const relationshipTrend = useMemo(() => {
    const now = new Date();
    let days = 7;
    if (timeFrame === 'today') days = 1;
    if (timeFrame === 'week') days = 7;
    if (timeFrame === 'month') days = 30;
    if (timeFrame === 'year') days = 365;

    const currentPeriodLogs = logs.filter(log => {
      const diff = (now.getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diff < days;
    });
    const prevPeriodLogs = logs.filter(log => {
      const diff = (now.getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diff >= days && diff < days * 2;
    });

    const currentRel = calculateStats(currentPeriodLogs).relationship;
    const prevRel = calculateStats(prevPeriodLogs).relationship;

    if (currentRel > prevRel) return 'up';
    if (currentRel < prevRel) return 'down';
    return 'stable';
  }, [logs, timeFrame]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [logs, searchQuery]);

  const addLog = (newLog: Omit<Log, 'id' | 'date' | 'completed'>) => {
    const log: Log = {
      ...newLog,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      completed: false
    };
    setLogs(prev => [log, ...prev]);
  };

  const toggleLog = async (id: string) => {
    const updatedLogs = logs.map(l => l.id === id ? { ...l, completed: !l.completed } : l);
    const completedLog = updatedLogs.find(l => l.id === id);
    
    setLogs(updatedLogs);

    if (completedLog?.completed) {
      if ('vibrate' in navigator) navigator.vibrate(50);
      const chance = Math.random();
      if (chance > 0.4) {
        const newInterruption = await generateSystemInterruption(completedLog, temporalStats);
        if (newInterruption) setInterruption(newInterruption);
      }
    }
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const triggerQuestGen = async () => {
    setIsSyncing(true);
    const newQuests = await generateQuests(logs, temporalStats);
    setQuests(newQuests);
    setIsSyncing(false);
  };

  const completeQuest = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        addLog({
          name: `Quest: ${q.description.slice(0, 20)}...`,
          category: 'Discipline',
          quantity: q.xpReward,
          unit: 'xp',
          difficulty: q.difficulty
        });
        setTimeout(() => {
          setLogs(currentLogs => {
            const lastLog = currentLogs[0];
            return currentLogs.map(l => l.id === lastLog.id ? {...l, completed: true} : l);
          });
        }, 100);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  const handleInterruptionResult = (success: boolean) => {
    if (success && interruption) {
      addLog({
        name: `Interruption: ${interruption.title}`,
        category: 'Discipline',
        quantity: interruption.xpReward,
        unit: 'xp',
        difficulty: 'MEDIUM'
      });
      setTimeout(() => {
        setLogs(currentLogs => {
          const lastLog = currentLogs[0];
          return currentLogs.map(l => l.id === lastLog.id ? {...l, completed: true} : l);
        });
      }, 100);
    }
    setInterruption(null);
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-600 rounded flex items-center justify-center font-bold text-xl mono shadow-[0_0_20px_rgba(139,92,246,0.5)]">M</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase mono italic">Monarch OS</h1>
          </div>
          <div className="space-y-1">
            {bootMessages.slice(0, bootStep).map((msg, i) => (
              <p key={i} className="text-[10px] mono text-zinc-500">{msg}</p>
            ))}
            {bootStep < bootMessages.length && (
              <p className="text-[10px] mono text-violet-400 font-bold uppercase">
                {bootMessages[bootStep]} <span className="cursor-blink">_</span>
              </p>
            )}
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full mt-4">
            <div 
              className="h-full bg-violet-600 transition-all duration-300" 
              style={{ width: `${(bootStep / bootMessages.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row relative selection:bg-violet-500/30 overflow-hidden">
      {interruption && (
        <SystemInterruption interruption={interruption} onResult={handleInterruptionResult} />
      )}

      {isAddingLog && (
        <LogForm onAdd={addLog} onClose={() => setIsAddingLog(false)} />
      )}

      {/* Navigation Layer */}
      <nav className="hidden md:flex w-64 border-r border-zinc-800 bg-[#0c0c0e] p-6 flex-col gap-8 sticky top-0 h-screen z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center font-bold text-lg mono">M</div>
          <h1 className="text-xl font-black tracking-tighter uppercase mono italic">Monarch OS</h1>
        </div>

        <div className="flex flex-col gap-1">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText size={16} />} label="Database" />
          <NavButton active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon={<Target size={16} />} label="Quests" />
          <NavButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={16} />} label="Terminal" />
        </div>

        <div className="mt-auto">
          <div className="mb-4 flex items-center gap-2 px-2">
            <Database size={12} className="text-zinc-600" />
            <span className="text-[8px] mono text-zinc-500 uppercase">Neural Node: connected</span>
          </div>
          <ProgressionCard progression={progression} />
        </div>
      </nav>

      {/* Main Execution Loop */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 h-screen custom-scrollbar bg-[#09090b]">
        {/* Mobile Status Bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center font-bold text-xs mono">M</div>
            <span className="text-sm font-black mono italic tracking-tighter">MONARCH</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Wifi size={12} className={isSyncing ? "text-violet-400 animate-pulse" : "text-zinc-700"} />
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? "bg-violet-400" : "bg-green-500"}`}></div>
            </div>
            <span className="text-[10px] mono text-zinc-400 font-bold uppercase">LV.{progression.level}</span>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">System Analytics</h1>
                <div className="flex items-center gap-3">
                  <p className="text-zinc-500 text-[10px] md:text-sm mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> 
                    LOCAL_DB // CLOUD_SYNC_ACTIVE
                  </p>
                  <span className="text-[8px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded mono text-zinc-500 uppercase tracking-widest">{progression.rank}</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingLog(true)}
                className="hidden md:flex bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold mono items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20 active:scale-95"
              >
                <Plus size={18} /> NEW LOG
              </button>
            </header>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 min-w-max mr-4">
                  <Clock size={14} className="text-violet-400" />
                  <span className="text-[10px] font-bold mono uppercase tracking-widest text-zinc-500">Temporal Filter</span>
                </div>
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 min-w-max">
                  {(['today', 'week', 'month', 'year'] as TimeFrame[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeFrame(tf)}
                      className={`px-4 py-1.5 text-[9px] font-bold mono uppercase rounded-md transition-all ${
                        timeFrame === tf 
                        ? 'bg-violet-600 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StatsRadar stats={temporalStats} trend={relationshipTrend} />
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  {(Object.entries(temporalStats) as [string, number][]).map(([key, val]) => (
                    <div key={key} className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl group hover:border-violet-500/30 transition-all hover:bg-zinc-900/60 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold mono group-hover:text-violet-400 transition-colors">{key}</span>
                        {val > 0 && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_5px_rgba(139,92,246,0.8)]"></div>}
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-zinc-100">{Math.floor(val)}</span>
                        <span className="text-[10px] text-zinc-600 mono uppercase">pts</span>
                      </div>
                      <div className="h-1 bg-zinc-800 mt-3 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-600/60 transition-all duration-1000" style={{ width: `${Math.min(100, (val / 150) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-zinc-600" />
                  <h3 className="text-[9px] font-black uppercase mono tracking-widest text-zinc-600">Recent Growth Packets</h3>
                </div>
                <button onClick={() => setActiveTab('logs')} className="text-[9px] font-bold uppercase mono text-violet-400 flex items-center gap-1 hover:underline">
                  Full Archive <ChevronRight size={10} />
                </button>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl divide-y divide-zinc-800/40 overflow-hidden">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-4 hover:bg-zinc-800/30 transition-colors group active:bg-zinc-800">
                    <button onClick={() => toggleLog(log.id)} className="transition-transform active:scale-90 p-1">
                      {log.completed ? <CheckCircle2 className="text-violet-500" size={20} /> : <Circle size={20} className="text-zinc-700 hover:text-zinc-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${log.completed ? 'line-through text-zinc-600 italic' : 'text-zinc-200'}`}>{log.name}</p>
                      <div className="flex gap-2 items-center mt-0.5">
                         <span className={`text-[8px] px-1.5 py-0.5 rounded border mono font-bold ${CATEGORY_COLORS[log.category]}`}>{log.category}</span>
                         <span className="text-[8px] text-zinc-600 mono">{log.quantity} {log.unit}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-700 mono uppercase font-bold">{log.difficulty}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-zinc-600 mono text-xs uppercase italic tracking-tighter">System is idle. Initiate primary activity log.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Dynamic Tab Switching */}
        {activeTab === 'logs' && (
          <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">Master DB Archive</h1>
                <p className="text-zinc-500 text-[10px] mono">Audit comprehensive history of growth cycles.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-violet-400" />
                  <input 
                    type="text" 
                    placeholder="Search cycles..." 
                    className="bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 ring-violet-500 outline-none w-full md:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </header>
            <div className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden">
               <div className="divide-y divide-zinc-800">
                {filteredLogs.length > 0 ? filteredLogs.map(l => (
                  <div key={l.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleLog(l.id)}>{l.completed ? <CheckCircle2 size={18} className="text-violet-500"/> : <Circle size={18} className="text-zinc-800"/>}</button>
                      <span className={`text-sm ${l.completed ? 'text-zinc-600 line-through' : ''}`}>{l.name}</span>
                    </div>
                    <button onClick={() => deleteLog(l.id)} className="text-zinc-800 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                )) : <div className="p-12 text-center text-zinc-700 mono text-[10px]">EMPTY_BUFFER</div>}
               </div>
            </div>
          </div>
        )}
        
        {activeTab === 'quests' && (
          <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Neural Challenges</h2>
              <button onClick={triggerQuestGen} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors" title="Force Recalculation">
                <Wifi size={16} className={isSyncing ? "text-violet-500 animate-pulse" : "text-zinc-500"} />
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.map(q => <QuestCard key={q.id} quest={q} onComplete={completeQuest} />)}
              {quests.length === 0 && (
                <div className="col-span-2 p-20 border border-dashed border-zinc-800 rounded-3xl text-center">
                  <p className="text-zinc-700 mono text-xs uppercase">No pending quests in queue. Request system uplink.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'console' && (
          <div className="p-4 md:p-10 h-full flex flex-col max-w-5xl mx-auto">
            <AIConsole logs={logs} stats={temporalStats} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-zinc-900 flex justify-around items-center px-4 pt-3 pb-safe z-30 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Analyze" />
        <MobileNavButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText size={20} />} label="Archive" />
        
        <button 
          onClick={() => setIsAddingLog(true)}
          className="relative -top-6 w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] active:scale-90 active:bg-violet-500 transition-all ring-4 ring-black"
        >
          <Plus size={28} />
        </button>

        <MobileNavButton active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon={<Target size={20} />} label="Quests" />
        <MobileNavButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={20} />} label="Sync" />
      </div>
    </div>
  );
};

// Sub-components
const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group ${active ? 'bg-zinc-900 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
  >
    <span className={active ? 'text-violet-500' : 'text-zinc-600 group-hover:text-zinc-400'}>{icon}</span>
    <span className="mono text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all w-16 ${active ? 'text-violet-500' : 'text-zinc-700'}`}
  >
    <div className={active ? "scale-110 transition-transform" : ""}>{icon}</div>
    <span className="text-[7px] mono font-black uppercase tracking-widest">{label}</span>
  </button>
);

const ProgressionCard = ({ progression }: { progression: Progression }) => (
  <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 shadow-inner">
    <div className="flex justify-between items-baseline mb-3">
      <span className="text-[9px] font-black text-violet-400 mono uppercase tracking-tighter">{progression.rank}</span>
      <span className="text-sm font-black mono italic text-zinc-100">LV.{progression.level}</span>
    </div>
    <div className="h-1 bg-black rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-violet-800 to-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.4)] transition-all duration-1000" 
        style={{ width: `${(progression.xp / progression.xpToNext) * 100}%` }}
      ></div>
    </div>
    <div className="flex justify-between mt-2">
      <span className="text-[7px] text-zinc-600 mono uppercase font-bold">Neural Progress</span>
      <span className="text-[7px] text-zinc-500 mono font-bold">{progression.xp} / {progression.xpToNext} XP</span>
    </div>
  </div>
);

export default App;
