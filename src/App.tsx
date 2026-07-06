import React, { useState } from 'react';
import Header from './components/Header';
import MatchTracker from './components/MatchTracker';
import MuzCafes from './components/MuzCafes';
import ServerlessForum from './components/ServerlessForum';
import SportsNews from './components/SportsNews';
import AIAnalytics from './components/AIAnalytics';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('maçlar');

  const renderContent = () => {
    switch (activeTab) {
      case 'maçlar': return (
        <div className="flex flex-col h-full overflow-hidden">
           <div className="p-4 lg:p-8 pb-0">
              <AIAnalytics matches={[]} news={[]} />
           </div>
           <div className="flex-1 overflow-hidden">
              <MatchTracker />
           </div>
        </div>
      );
      case 'forum': return <ServerlessForum />;
      case 'muzcafe': return <MuzCafes />;
      case 'haberler': return <SportsNews />;
      default: return <MatchTracker />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-black">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
      <footer className="h-8 bg-primary flex items-center px-4 justify-between text-[10px] font-black text-black uppercase tracking-widest shrink-0">
        <div className="flex gap-6"><span>Veri Akışı: Aktif</span><span>Bağlı Sunucu: P2P Mesh</span><span>Forum Durumu: Senkronize</span></div>
        <div className="flex gap-6"><span>Aktif Kullanıcı: 1,284</span><span>Sistem Zamanı: {new Date().toLocaleTimeString()}</span></div>
      </footer>
    </div>
  );
};

export default App;
