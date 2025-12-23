
import React, { useState, useEffect } from 'react';
import { Cpu, AlertCircle, Eye, EyeOff, UserPlus, LogIn, Fingerprint, ChevronLeft } from 'lucide-react';
import { db } from '../services/db';
import { authenticateBiometrically, isBiometricsAvailable } from '../services/biometricService';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'selection' | 'login' | 'register'>('selection');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [canBiometric, setCanBiometric] = useState(false);

  useEffect(() => {
    // Check if biometric login is potentially available for a returning user
    const savedBioEmail = localStorage.getItem('monarch_biometric_email');
    if (savedBioEmail && isBiometricsAvailable()) {
      setCanBiometric(true);
    }
  }, []);

  const handleBiometricAuth = async () => {
    setError(null);
    const success = await authenticateBiometrically();
    if (success) {
      const email = localStorage.getItem('monarch_biometric_email');
      if (email) {
        onLogin(email);
      } else {
        setError("Biometric link found but identity mapping is missing.");
      }
    } else {
      setError("Biometric verification failed.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.includes('@')) {
          setError("Please enter a valid neural email address.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Security password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const user = await db.register(email, password);
        if (user) {
          onLogin(user.email);
        } else {
          setError("This email is already linked to another neural node.");
        }
      } else {
        const user = await db.login(email, password);
        if (user) {
          onLogin(user.email);
        } else {
          setError("Access Denied: Invalid credentials.");
        }
      }
    } catch (err) {
      setError("System Error: Connection to DB failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 font-sans overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[350px] space-y-3 z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Selection Screen */}
        {mode === 'selection' ? (
          <div className="bg-zinc-950 border border-zinc-800 p-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-10 gap-2">
              <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] rotate-3">
                <Cpu className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-zinc-100 mt-4">
                Monarch OS
              </h1>
              <p className="text-[10px] text-zinc-500 mono uppercase tracking-widest">Neural Interface Login</p>
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={() => setMode('login')}
                className="w-full group bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <LogIn size={18} />
                Existing Monarch
              </button>

              <button 
                onClick={() => setMode('register')}
                className="w-full group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-200 font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <UserPlus size={18} />
                New Candidate
              </button>

              {canBiometric && (
                <>
                  <div className="flex items-center gap-4 py-4">
                    <div className="h-px bg-zinc-800 flex-1"></div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mono">OR</span>
                    <div className="h-px bg-zinc-800 flex-1"></div>
                  </div>
                  <button 
                    onClick={handleBiometricAuth}
                    className="w-full text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors py-2 flex items-center justify-center gap-2"
                  >
                    <Fingerprint size={16} />
                    Quick Unlock
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Login/Register Form */
          <div className="bg-zinc-950 border border-zinc-800 p-8 pt-6 pb-6 flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => setMode('selection')}
              className="self-start text-zinc-500 hover:text-zinc-300 transition-colors mb-4 flex items-center gap-1 text-[10px] mono uppercase font-bold"
            >
              <ChevronLeft size={14} /> Back
            </button>

            <div className="flex flex-col items-center mb-8 gap-2">
              <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] rotate-3">
                <Cpu className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-zinc-100 mt-2">
                {mode === 'login' ? 'Sign In' : 'Create Node'}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-2">
              <input
                type="email"
                required
                placeholder="Email address"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-600 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-lg shadow-violet-900/10 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Initializing..." : mode === 'login' ? "Log In" : "Sign Up"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-red-500 text-[11px] text-center leading-tight bg-red-500/5 p-3 rounded-md border border-red-500/20">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Toggle View (Bottom Card) */}
        {mode !== 'selection' && (
          <div className="bg-zinc-950 border border-zinc-800 p-5 text-center">
            <p className="text-xs text-zinc-400">
              {mode === 'login' ? "Don't have an account? " : "Have an account? "}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                {mode === 'login' ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
            {['About', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Neural Link'].map(link => (
              <span key={link} className="text-[10px] text-zinc-600 hover:underline cursor-pointer">{link}</span>
            ))}
          </div>
          <div className="flex gap-4 items-center">
             <span className="text-[10px] text-zinc-600 uppercase mono">© 2024 Monarch OS from Neural Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
