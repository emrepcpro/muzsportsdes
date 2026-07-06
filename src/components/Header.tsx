import React, { useState, useEffect } from 'react';
import { Trophy, MessageSquare, Coffee, Newspaper, Smartphone, Bell, User } from 'lucide-react';
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
  const [isDataActive, setIsDataActive] = useState(true);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);

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
    <header className="h-20 bg-background border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-black font-bold italic px-2 py-1 rounded text-xl">MS</div>
          <span className="font-bold tracking-tighter text-2xl hidden md:block">MUZSPORTS</span>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary text-black"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 bg-background-inner px-3 py-1.5 rounded-full border border-white/5">
          <div className={cn("w-2 h-2 rounded-full", isDataActive ? "bg-primary animate-pulse" : "bg-red-500")} />
          <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">
            {isDataActive ? 'Canlı Veri Bağlı' : 'Bağlantı Kesildi'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-white/60">
          <button
            onClick={() => setIsMobileSyncOpen(true)}
            className="hover:text-primary transition-colors"
          ><Smartphone size={20} /></button>
          <button className="hover:text-primary transition-colors relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{username}</div>
            <div className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">Galatasaray</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-background-inner border border-primary/20 flex items-center justify-center text-primary">
            <User size={24} />
          </div>
        </div>
      </div>

      <MobileSync isOpen={isMobileSyncOpen} onClose={() => setIsMobileSyncOpen(false)} />
    </header>
  );
};

export default Header;
