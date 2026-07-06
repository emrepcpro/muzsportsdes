import React, { useState, useEffect } from 'react';
import { Trophy, MessageSquare, Coffee, Newspaper, Smartphone, Bell, User, Search, Settings } from 'lucide-react';
import { storage } from '@/lib/storage';
import { p2p } from '@/lib/p2p';
import MobileSync from './MobileSync';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Header: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const [username, setUsername] = useState(storage.get('username', 'Taraftar627'));
  const [isDataActive, setIsDataActive] = useState(storage.get('data_active', true));
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'USER_UPDATE') {
        setUsername(msg.payload.username);
      }
    });
    return () => { unsub(); };
  }, []);

  const toggleDataActive = () => {
    const newState = !isDataActive;
    setIsDataActive(newState);
    storage.set('data_active', newState);
  };

  const navItems = [
    { id: 'maçlar', label: 'MAÇLAR', icon: Trophy },
    { id: 'forum', label: 'FORUM', icon: MessageSquare },
    { id: 'muzcafe', label: 'MUZ CAFE', icon: Coffee },
    { id: 'haberler', label: 'HABERLER', icon: Newspaper },
  ];

  return (
    <header className="h-20 bg-background/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-[100]">
      <div className="flex items-center gap-12">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('maçlar')}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center p-1.5 shadow-neon transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
               <img src="/src/assets/logo.png" alt="MUZSPORTS" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -inset-1 bg-primary/20 blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-2xl text-gradient leading-none">MUZSPORTS</span>
            <span className="text-[9px] font-black tracking-[0.4em] text-primary mt-1 uppercase leading-none">P2P HUB & SOCIAL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden xl:flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs tracking-widest",
                activeTab === item.id
                  ? "bg-primary text-black shadow-neon"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={16} strokeWidth={2.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-8">
        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-background-inner rounded-full border border-white/5 shadow-inner">
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={toggleDataActive}>
            <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.5)]", isDataActive ? "bg-primary animate-pulse" : "bg-red-500")} />
            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">
              {isDataActive ? 'Canlı Veri Bağlı' : 'Bağlantı Kesildi'}
            </span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-primary tracking-widest uppercase">P2P MESH</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-4">
           <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Maç, Haber veya Oda Ara..."
                className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:border-primary/50 outline-none transition-all w-48 focus:w-64"
              />
           </div>

           <div className="flex items-center gap-1">
             <button
                onClick={() => setIsMobileSyncOpen(true)}
                className="p-2.5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
             >
                <Smartphone size={20} />
             </button>
             <button className="p-2.5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-bounce" />
             </button>
             <button className="p-2.5 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                <Settings size={20} />
             </button>
           </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4 pl-8 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-black text-white tracking-tight">{username}</div>
            <div className="text-[9px] text-primary font-black uppercase tracking-tighter">Premium Üye</div>
          </div>
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:border-primary/50 transition-all overflow-hidden shadow-neon">
               <User size={26} strokeWidth={2.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary border-4 border-background rounded-full" />
          </div>
        </div>
      </div>

      <MobileSync isOpen={isMobileSyncOpen} onClose={() => setIsMobileSyncOpen(false)} />
    </header>
  );
};

export default Header;
