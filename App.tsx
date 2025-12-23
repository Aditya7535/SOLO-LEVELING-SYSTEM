
import React, { useState, useEffect, useMemo } from 'react';
import { Log, UserStats, Progression, AIQuest, Interruption, Category, Achievement } from './types';
import { calculateProgression, calculateStats } from './engine';
import { generateQuests, generateSystemInterruption } from './services/aiService';
import { db } from './services/db';
import { registerBiometrics, isBiometricsAvailable } from './services/biometricService';
import StatsRadar from './components/StatsRadar';
import ContributionGrid from './components/ContributionGrid';
import ComplexityBreakdown from './components/ComplexityBreakdown';
import LogForm from './components/LogForm';
import QuestCard from './components/QuestCard';
import AIConsole from './components/AIConsole';
import SystemInterruption from './components/SystemInterruption';
import Login from './components/Login';
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
  Wifi,
  Zap,
  LogOut,
  Fingerprint,
  Settings
} from 'lucide-react';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('monarch_session_email'));
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);
  const [quests, setQuests] = useState<AIQuest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [interruption, setInterruption] = useState<Interruption | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'quests' | 'console'>('dashboard');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<'idle' | 'success' | 'unavailable'>(
    isBiometricsAvailable() ? 'idle' : 'unavailable'
  );

  const bootMessages = [
    "KERNEL_v4.5_INITIALIZING...",
    "HANDSHAKE_WITH_NEURAL_DATABASE...",
    "ESTABLISHING_ENCRYPTED_SESSION...",
    "DOWNLOADING_USER_HISTORY...",
    "READY_FOR_MONARCH_ASCENSION."
  ];

  const handleLogin = (email: string) => {
    localStorage.setItem('monarch_session_email', email);
    setUserEmail(email);
    setIsBooting(true);
    setBootStep(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('monarch_session_email');
    setUserEmail(null);
    setLogs([]);
    setQuests([]);
    setAchievements([]);
  };

  const handleLinkBiometrics = async () => {
    if (!userEmail) return;
    const credentialId = await registerBiometrics(userEmail, userEmail.split('@')[0]);
    if (credentialId) {
      localStorage.setItem('monarch_biometric_email', userEmail);
      setBiometricStatus('success');
      setTimeout(() => setBiometricStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    if (userEmail && bootStep < bootMessages.length) {
      const timer = setTimeout(() => setBootStep(prev => prev + 1), 400);
      return () => clearTimeout(timer);
    } else if (userEmail) {
      setTimeout(() => setIsBooting(false), 600);
    }
  }, [bootStep, userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    const initData = async () => {
      setIsSyncing(true);
      const [savedLogs, savedQuests, savedAch] = await Promise.all([
        db.getLogs(userEmail),
        db.getQuests(userEmail),
        db.getAchievements(userEmail)
      ]);
      setLogs(savedLogs);
      setQuests(savedQuests);
      setAchievements(savedAch);
      setIsSyncing(false);
    };
    initData();
  }, [userEmail]);

  useEffect(() => { if (userEmail) db.saveLogs(logs, userEmail); }, [logs, userEmail]);
  useEffect(() => { if (userEmail) db.saveQuests(quests, userEmail); }, [quests, userEmail]);
  useEffect(() => { if (userEmail) db.saveAchievements(achievements, userEmail); }, [achievements, userEmail]);

  const progression = useMemo(() => calculateProgression(logs), [logs]);
  const temporalStats = useMemo(() => calculateStats(logs), [logs]);

  const addLog = (newLog: Omit<Log, 'id' | 'date' | 'completed'>) => {
    const log: Log = { ...newLog, id: crypto.randomUUID(), date: new Date().toISOString(), completed: false };
    setLogs(prev => [log, ...prev]);
  };

  const toggleLog = async (id: string) => {
    const updatedLogs = logs.map(l => l.id === id ? { ...l, completed: !l.completed } : l);
    const completedLog = updatedLogs.find(l => l.id === id);
    setLogs(updatedLogs);
    if (completedLog?.completed && Math.random() > 0.4) {
      const newInterruption = await generateSystemInterruption(completedLog, temporalStats);
      if (newInterruption) setInterruption(newInterruption);
    }
  };

  if (!userEmail) return <Login onLogin={handleLogin} />;

  if (isBooting) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-600 rounded flex items-center justify-center font-bold text-xl mono shadow-[0_0_20px_rgba(139,92,246,0.5)]">M</div>
            <h1 className="text-2xl font-black tracking-tighter uppercase mono italic">Monarch OS</h1>
          </div>
          <div className="space-y-1">
            {bootMessages.slice(0, bootStep).map((msg, i) => <p key={i} className="text-[10px] mono text-zinc-500">{msg}</p>)}
          </div>
          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full mt-4">
            <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${(bootStep / bootMessages.length) * 100}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden relative selection:bg-violet-500/30">
      {interruption && <SystemInterruption interruption={interruption} onResult={(res) => { if(res && interruption) addLog({name: `Interruption: ${interruption.title}`, category: 'Discipline', quantity: interruption.xpReward, unit: 'xp', difficulty: 'MEDIUM'}); setInterruption(null); }} />}
      {isAddingLog && <LogForm onAdd={addLog} onClose={() => setIsAddingLog(false)} />}

      {/* FIXED HEADER (iOS/Android Native Style) */}
      <header className="pt-safe px-4 pb-2 bg-black/80 backdrop-blur-md border-b border-zinc-900 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center font-black text-xs mono">M</div>
          <span className="text-xs font-black mono tracking-tighter uppercase italic text-zinc-400">Monarch v4.5</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setIsSyncing(true); setTimeout(() => setIsSyncing(false), 1000); }} className="p-1.5 text-zinc-500 hover:text-white transition-colors">
            <Wifi size={16} className={isSyncing ? "text-violet-500 animate-pulse" : ""} />
          </button>
          <button onClick={handleLogout} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* SCROLLABLE MAIN BODY */}
      <main className="flex-1 app-scroll-container pb-32">
        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <div className="p-4 space-y-6">
              <section className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-4">
                <div className="flex justify-between items-start mb-4">
                   <div className="space-y-1">
                      <span className="text-[10px] mono text-zinc-500 uppercase font-black">Current Status</span>
                      <h2 className="text-xl font-black italic tracking-tighter text-zinc-100">{progression.rank}</h2>
                   </div>
                   <div className="text-right">
                      <span className="text-xs font-black mono text-violet-400">LVL.{progression.level}</span>
                      <p className="text-[10px] mono text-zinc-600">{progression.xp}/{progression.xpToNext} XP</p>
                   </div>
                </div>
                <div className="h-1.5 bg-black rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400" style={{ width: `${(progression.xp/progression.xpToNext)*100}%` }}></div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-3">
                 <StatSummaryCard icon={<Zap size={14} className="text-amber-500"/>} label="STREAK" value={progression.streak} unit="DAYS" />
                 <StatSummaryCard icon={<CheckCircle2 size={14} className="text-emerald-500"/>} label="SOLVED" value={progression.totalLogs} unit="LOGS" />
              </div>

              <ComplexityBreakdown logs={logs} totalLogs={progression.totalLogs} achievements={achievements} />
              <StatsRadar stats={temporalStats} />
              <ContributionGrid logs={logs} />
              
              {/* Device-Specific Settings Link */}
              <div className="pt-4 border-t border-zinc-900 space-y-3">
                <span className="text-[10px] mono text-zinc-600 uppercase font-black ml-1">Device Links</span>
                <button onClick={handleLinkBiometrics} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group active:scale-[0.98] transition-transform">
                  <div className="flex items-center gap-3">
                    <Fingerprint size={20} className={biometricStatus === 'success' ? 'text-green-500' : 'text-zinc-500'} />
                    <span className="text-xs font-bold text-zinc-300">Biometric Sync</span>
                  </div>
                  <span className="text-[10px] mono text-zinc-600 font-bold uppercase">{biometricStatus === 'success' ? 'LINKED' : 'UNLINKED'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="p-4 space-y-4">
               <div className="sticky top-0 bg-black pt-2 pb-4 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="Filter node logs..." 
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-xs focus:border-violet-500 outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  {logs.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(l => (
                    <div key={l.id} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 flex items-center justify-between active:bg-zinc-800/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <button onClick={() => toggleLog(l.id)}>
                            {l.completed ? <CheckCircle2 size={20} className="text-violet-500"/> : <Circle size={20} className="text-zinc-700"/>}
                          </button>
                          <div className="flex flex-col">
                             <span className={`text-sm font-bold ${l.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{l.name}</span>
                             <span className="text-[9px] mono text-zinc-600 uppercase font-black">{l.category} // {new Date(l.date).toLocaleDateString()}</span>
                          </div>
                       </div>
                       <button onClick={() => setLogs(prev => prev.filter(x => x.id !== l.id))} className="text-zinc-800 active:text-red-500 p-2">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'quests' && (
            <div className="p-4 space-y-6">
               <div className="flex justify-between items-center px-1">
                  <h2 className="text-sm font-black mono uppercase tracking-widest text-zinc-400">Active Quests</h2>
                  <button onClick={() => generateQuests(logs, temporalStats).then(setQuests)} className="text-xs font-black mono text-violet-500 uppercase">Refresh</button>
               </div>
               <div className="space-y-4">
                  {quests.map(q => <QuestCard key={q.id} quest={q} onComplete={(id) => {
                    const qst = quests.find(x => x.id === id);
                    if (qst) {
                      addLog({ name: `Quest: ${qst.description}`, category: 'Discipline', quantity: qst.xpReward, unit: 'xp', difficulty: qst.difficulty });
                      setQuests(prev => prev.map(x => x.id === id ? {...x, completed: true} : x));
                    }
                  }} />)}
               </div>
            </div>
          )}

          {activeTab === 'console' && (
            <div className="p-4 h-full flex flex-col min-h-[500px]">
               <AIConsole logs={logs} stats={temporalStats} />
            </div>
          )}
        </div>
      </main>

      {/* FIXED NATIVE TAB BAR */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-900 flex justify-around items-center px-4 pt-3 pb-safe z-40">
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={22} />} label="ANALYZE" />
        <MobileNavButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText size={22} />} label="ARCHIVE" />
        
        {/* Floating Action Button (FAB) Style */}
        <button 
          onClick={() => setIsAddingLog(true)} 
          className="relative -top-8 w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(139,92,246,0.5)] active:scale-90 transition-transform ring-4 ring-black"
        >
          <Plus size={28} />
        </button>
        
        <MobileNavButton active={activeTab === 'quests'} onClick={() => setActiveTab('quests')} icon={<Target size={22} />} label="QUESTS" />
        <MobileNavButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={22} />} label="SYNC" />
      </footer>
    </div>
  );
};

const StatSummaryCard = ({ icon, label, value, unit }: any) => (
  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-3 flex flex-col gap-1">
     <div className="flex items-center gap-2">
        {icon}
        <span className="text-[8px] mono text-zinc-600 font-black uppercase tracking-widest">{label}</span>
     </div>
     <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-zinc-100">{value}</span>
        <span className="text-[8px] mono text-zinc-700 font-black">{unit}</span>
     </div>
  </div>
);

const MobileNavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1.5 w-16 transition-colors ${active ? 'text-violet-500' : 'text-zinc-700'}`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
      {icon}
    </div>
    <span className="text-[7px] mono font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
