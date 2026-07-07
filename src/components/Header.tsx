import React, { useState, useEffect } from 'react';
import { Trophy, MessageSquare, Coffee, Newspaper, Smartphone, Bell, User, Sparkles } from 'lucide-react';
import { storage } from '@/lib/storage';
import { p2p } from '@/lib/p2p';
import MobileSync from './MobileSync';
import Account from './Account';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '@/assets/logo.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Header: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const [username, setUsername] = useState(storage.get('username', 'Taraftar627'));
  const [isDataActive, setIsDataActive] = useState(true);
  const [isMobileSyncOpen, setIsMobileSyncOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
            <img src={logo} alt="MuzSports logo" className="h-10 w-10 rounded-xl object-cover" />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">MuzSports</div>
              <div className="text-xs font-semibold text-white/70">Serverless Fan Hub</div>
            </div>
          </div>
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
        <div className="hidden md:flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 shadow-[0_0_18px_rgba(132,204,22,0.15)]">
          <div className={cn("h-2.5 w-2.5 rounded-full", isDataActive ? "bg-primary animate-pulse" : "bg-red-500")} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
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

        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <div className="hidden text-right sm:block">
            <div className="text-xs font-bold text-white">{username}</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/35">Galatasaray</div>
          </div>
          <button onClick={() => setIsAccountOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-background-inner text-primary">
            <User size={24} />
          </button>
        </div>
      </div>

      {isAccountOpen && <Account onClose={() => setIsAccountOpen(false)} />}
      <MobileSync isOpen={isMobileSyncOpen} onClose={() => setIsMobileSyncOpen(false)} />
    </header>
  );
};

export default Header;
