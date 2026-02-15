import React, { useState, useEffect } from 'react';
import { Facehash } from 'facehash';
import { Scan, ShieldCheck, ChevronRight, AlertTriangle, Lock } from 'lucide-react';

const IdentityScanner = () => {
  const [name, setName] = useState(() => {
    // Check sessionStorage immediately on component creation
    return sessionStorage.getItem('sdcra_user') || '';
  });
  const [isLocked, setIsLocked] = useState(() => {
    // Check if user is already logged in
    return !!sessionStorage.getItem('sdcra_user');
  });
  const [randomHash, setRandomHash] = useState('000000');
  const [isFocused, setIsFocused] = useState(false);

  // "Decoding" effect for hash text
  useEffect(() => {
    if (isLocked) return;
    const interval = setInterval(() => {
      setRandomHash(Math.random().toString(36).substring(7).toUpperCase());
    }, 100);
    return () => clearInterval(interval);
  }, [isLocked]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLocked(true);
    
    // SAVE TO SESSION ONLY (Disappears when tab closes)
    sessionStorage.setItem('sdcra_user', name);
    
    // Dispatch event for AI Terminal
    window.dispatchEvent(new CustomEvent('USER_LOGIN', { detail: name }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sdcra_user');
    setIsLocked(false);
    setName('');
    window.dispatchEvent(new CustomEvent('USER_LOGOUT'));
  };

  return (
    <div className="flex flex-col gap-3 max-w-md">
      <div className={`relative group transition-all duration-500 ${isFocused ? 'scale-[1.02]' : ''}`}>
        
        {/* 1. THE CARD CONTAINER */}
        <div className="w-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 flex items-center gap-4 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
          
          {/* 2. THE FACE HASH (Updates as you type) */}
          <div className="relative shrink-0">
            <div className={`w-16 h-16 overflow-hidden border-2 ${isLocked ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-cyan-500/50'} transition-all duration-300 bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900`}>
               <Facehash 
                 name={name || "SDCRA-GUEST"}
                 colors={['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']}
                 style={{ width: '100%', height: '100%', display: 'block' }}
               />
            </div>
            {/* Status Dot */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${isLocked ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
          </div>

          {/* 3. THE INPUT FIELD */}
          <div className="flex-1 min-w-0 z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs uppercase tracking-widest text-slate-500 font-mono flex items-center gap-1">
                {isLocked ? <Lock className="w-3 h-3" /> : <Scan className="w-3 h-3" />}
                {isLocked ? 'IDENTITY VERIFIED' : 'ENTER CALLSIGN'}
              </span>
             
            </div>

            {!isLocked ? (
              <form onSubmit={handleLogin} className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="TYPE NAME..."
                  className="w-full bg-transparent text-white font-bold tracking-wider outline-none placeholder:text-slate-700 font-mono text-xl uppercase"
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className={`absolute right-0 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-white transition-all ${name ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}
                  disabled={!name}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-white font-mono tracking-wider uppercase">
                  {name}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-500/50 px-2 py-1 rounded transition-colors uppercase tracking-widest"
                >
                  [ RESET ]
                </button>
              </div>
            )}
          </div>
          
          {/* Decorative Background Glow */}
          {!isLocked && (
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
          )}
        </div>
      </div>
      
      {/* Privacy Protocol Disclaimer */}
      <div className="flex items-start gap-2 text-xs font-mono">
        <p className="text-slate-500 leading-tight">
        </p>
      </div>
    </div>
  );
};

export default IdentityScanner;
