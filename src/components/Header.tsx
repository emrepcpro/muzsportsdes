import React, { useState, useEffect } from 'react';
import { Trophy, MessageSquare, Coffee, Newspaper, Smartphone, Bell, User, Search, Settings, Sparkles } from 'lucide-react';
import { storage } from '../lib/storage';
import { p2p } from '../lib/p2p';
import MobileSync from './MobileSync';
import AISettings from './AISettings';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '../assets/logo.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Header: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const [username, setUsername] = useState(storage.get('username', 'Taraftar627'));
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'USER_UPDATE') {
        setUsername(msg.payload.username);
      }
    });
    return () => { unsub(); };
  }, []);

  const navItems = [
    { id: 'maçlar', label: 'MAÇLAR', icon: Trophy },
    { id: 'forum', label: 'FORUM', icon: MessageSquare },
    { id: 'muzcafe', label: 'MUZ CAFE', icon: Coffee },
    { id: 'haberler', label: 'HABERLER', icon: Newspaper },
  ];

  return (
    <header className="h-24 bg-background border-b border-white/5 flex items-center justify-between px-10 sticky top-0 z-[100] shadow-stadium backdrop-blur-3xl bg-background/80">
      <div className="flex items-center gap-16">
        {/* Official Brand Logo */}
        <div className="flex items-center gap-6 group cursor-pointer" onClick={() => setActiveTab('maçlar')}>
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center p-0 shadow-neon transform group-hover:scale-105 transition-all duration-500 overflow-hidden border border-white/5">
               <img src={logo} alt="MuzSports" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -inset-2 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-black tracking-tighter text-3xl text-gradient leading-none">MUZSPORTS</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-neon" />
               <span className="text-[9px] font-black tracking-[0.4em] text-primary uppercase leading-none">MESH NETWORK ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Professional Navigation */}
        <nav className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "nav-link",
                activeTab === item.id ? "nav-link-active" : "nav-link-inactive"
              )}
            >
              <item.icon size={16} strokeWidth={3} />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-10">
        {/* Dynamic Global Controls */}
        <div className="flex items-center gap-6">
           <div className="relative group hidden 2xl:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="ARA: TAKIM, HABER, ODA..."
                className="bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-black tracking-widest focus:border-primary/40 outline-none transition-all w-64 focus:w-80 uppercase placeholder:text-white/10"
              />
           </div>

           <div className="flex items-center gap-1.5">
             <button
                onClick={() => setIsAISettingsOpen(true)}
                className="p-3 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all group relative"
                title="AI Analiz Ayarları"
             >
                <Sparkles size={20} strokeWidth={2.5} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-neon" />
             </button>
             <button
                onClick={() => setIsMobileSyncOpen(true)}
                className="p-3 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
             >
                <Smartphone size={20} strokeWidth={2.5} />
             </button>
             <button className="p-3 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative">
                <Bell size={20} strokeWidth={2.5} />
                <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full border border-background shadow-lg" />
             </button>
             <button className="p-3 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                <Settings size={20} strokeWidth={2.5} />
             </button>
           </div>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-5 pl-10 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black text-white tracking-tight uppercase">{username}</div>
            <div className="text-[9px] text-primary font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5 justify-end">
               <div className="w-1 h-1 bg-primary rounded-full shadow-neon" />
               PRO EKOSİSTEM
            </div>
          </div>
          <div className="relative group cursor-pointer" onClick={() => {
            const newName = prompt('Yeni Kullanıcı Adı:', username);
            if (newName) {
              storage.set('username', newName);
              setUsername(newName);
              p2p.broadcast('USER_UPDATE', { username: newName });
            }
          }}>
            <div className="w-12 h-12 rounded-xl bg-background-inner border border-white/10 flex items-center justify-center text-white/20 group-hover:border-primary/50 transition-all overflow-hidden shadow-inner hover:shadow-neon">
               <User size={24} strokeWidth={2.5} className="group-hover:text-primary transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary border-4 border-background rounded-full shadow-neon" />
          </div>
        </div>
      </div>

      <MobileSync isOpen={isMobileSyncOpen} onClose={() => setIsMobileSyncOpen(false)} />
      <AISettings isOpen={isAISettingsOpen} onClose={() => setIsAISettingsOpen(false)} />
    </header>
  );
};

export default Header;
