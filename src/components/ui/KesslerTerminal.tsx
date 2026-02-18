import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Wifi, AlertTriangle, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { processLocalCommand, LocalResponse } from '@/lib/kessler-local-brain';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLocal?: boolean;
  timestamp: Date;
}

export const KesslerTerminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
  { 
    id: '1', 
    text: 'Orion here. Systems are green. What are we tracking today?', 
    isUser: false, 
    timestamp: new Date() 
  }
]);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<'CLOUD' | 'LOCAL'>('CLOUD');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if name exists on load
    const savedName = sessionStorage.getItem('sdcra_user');
    if (savedName) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: `WELCOME BACK, COMMANDER ${savedName.toUpperCase()}.`, isUser: false, timestamp: new Date() }]);
    }

    // Listen for new logins (real-time)
    const handleLogin = (e: any) => {
      const newName = e.detail;
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), text: `BIOMETRIC SCAN COMPLETE.`, isUser: false, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), text: `Greetings, Commander ${newName}. Clearance Level 4 granted.`, isUser: false, timestamp: new Date() }
      ]);
    };

    const handleLogout = () => {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'SESSION TERMINATED. USER LOGGED OUT.', isUser: false, timestamp: new Date() }]);
    };

    window.addEventListener('USER_LOGIN', handleLogin);
    window.addEventListener('USER_LOGOUT', handleLogout);
    
    return () => {
      window.removeEventListener('USER_LOGIN', handleLogin);
      window.removeEventListener('USER_LOGOUT', handleLogout);
    };
  }, []);

  // Scroll detection to hide/show button
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      // Attempt cloud AI with 20-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('http://localhost:3001/api/ai/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: input.trim() }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Cloud AI response unavailable.',
        isUser: false,
        isLocal: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setMode('CLOUD');

    } catch (error) {
      // Fallback to local brain
      console.log('Cloud AI failed, falling back to local brain:', error);
      setMode('LOCAL');
      
      const localResponse: LocalResponse = processLocalCommand(input.trim());
      
      const localMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: localResponse.text,
        isUser: false,
        isLocal: true,
        timestamp: localResponse.timestamp
      };

      setMessages(prev => [...prev, localMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleTerminal = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleTerminal}
        className={`btn-glass fixed bottom-6 right-6 z-50 px-4 py-2 text-slate-200 font-mono text-sm uppercase tracking-wider transition-all duration-300 ${
          isScrolled ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <Terminal className="w-4 h-4" />
        [ ASK ORION ]
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-24 z-50 w-96 bg-slate-950 border border-cyan-500/30 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
      {/* Header */}
      <div className={`p-3 border-b flex items-center justify-between ${
        mode === 'CLOUD' 
          ? 'bg-slate-900 border-cyan-500/30' 
          : 'bg-orange-950/20 border-orange-500/30'
      }`}>
        <div className="flex items-center gap-2">
          {mode === 'CLOUD' ? (
            <Wifi className="w-4 h-4 text-cyan-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          )}
          <span className={`font-mono text-xs uppercase tracking-wider ${
            mode === 'CLOUD' ? 'text-cyan-400' : 'text-orange-400'
          }`}>
            {mode === 'CLOUD' ? 'ORION_UPLINK // ACTIVE' : 'ORION // OFFLINE'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3 text-slate-400" /> : <Minimize2 className="w-3 h-3 text-slate-400" />}
          </button>
          <button
            onClick={toggleTerminal}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs font-mono mt-8">
                <div className="mb-2">KESSLER TERMINAL v2.4</div>
                <div>TYPE COMMAND OR QUERY</div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`text-xs font-mono ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                <div className={`inline-block max-w-[90%] p-2 rounded ${
                  message.isUser
                    ? 'bg-cyan-900/30 text-cyan-300 border border-cyan-500/20'
                    : message.isLocal
                    ? 'bg-orange-950/20 text-orange-300 border border-orange-500/20'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {message.text}
                </div>
                <div className="text-slate-600 text-[10px] mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="text-left">
                <div className="inline-block bg-slate-800 text-slate-400 text-xs font-mono p-2 rounded border border-slate-700">
                  PROCESSING...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER COMMAND..."
                className="flex-1 bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono px-2 py-1 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                disabled={isThinking}
              />
              <button
                type="submit"
                disabled={isThinking || !input.trim()}
                className="p-1 bg-slate-800/40 border border-slate-600/40 text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
