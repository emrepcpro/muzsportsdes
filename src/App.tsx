import React, { useState, useEffect } from 'react';
import { Match, NewsArticle } from './types';
import Header from './components/Header';
import MatchList from './components/MatchList';
import MatchDetail from './components/MatchDetail';
import MuzCafes from './components/MuzCafes';
import ServerlessForum from './components/ServerlessForum';
import SportsNews from './components/SportsNews';
import AIAnalytics from './components/AIAnalytics';
import { dataService } from './lib/data';
import { p2p } from './lib/p2p';
import { ai } from './lib/ai';
import { Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('maçlar');
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const data = await dataService.getLiveScores();
    const processed = await Promise.all(data.map(async (m) => {
      if (ai.shouldSummarize(m.date)) {
         const summary = await ai.summarizeMatch(m);
         return { ...m, aiSummary: summary };
      }
      return { ...m, aiSummary: undefined };
    }));
    setMatches(processed);
    setLoading(false);
    if (processed.length > 0 && !selectedMatch) {
      setSelectedMatch(processed[0]);
    }
    p2p.broadcast('MATCH_SYNC', { matches: processed });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);

    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'MATCH_SYNC' && msg.senderId !== p2p.getSenderId()) {
        setMatches(msg.payload.matches);
        if (!selectedMatch && msg.payload.matches.length > 0) {
           setSelectedMatch(msg.payload.matches[0]);
        }
      } else if (msg.type === 'MATCH_UPDATE') {
        setMatches(prev => prev.map(m => m.id === msg.payload.id ? { ...m, ...msg.payload } : m));
        if (selectedMatch?.id === msg.payload.id) {
          setSelectedMatch(prev => prev ? { ...prev, ...msg.payload } : null);
        }
      }
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [selectedMatch]);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'maçlar': return <MatchDetail match={selectedMatch} />;
      case 'forum': return <ServerlessForum />;
      case 'muzcafe': return <MuzCafes />;
      case 'haberler': return <SportsNews onNewsUpdate={setNews} />;
      default: return <MatchDetail match={selectedMatch} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-white selection:bg-primary selection:text-black overflow-hidden">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex overflow-hidden">
        {/* Column 1: Live Matches (Hidden on Mobile if not on 'maçlar' tab, but standard for dashboard) */}
        <div className="hidden xl:block w-80 shrink-0">
          <MatchList
            matches={matches}
            selectedMatchId={selectedMatch?.id}
            onSelectMatch={setSelectedMatch}
          />
        </div>

        {/* Column 2: Main Content */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
          {renderMainContent()}
        </div>

        {/* Column 3: AI Analytics & Stats (Desktop Only) */}
        <div className="hidden 2xl:block w-96 shrink-0 bg-background-inner/30 p-8 overflow-y-auto custom-scrollbar">
           <div className="space-y-10">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary rounded-full shadow-neon" />
                 <h3 className="font-black text-xs tracking-[0.2em] uppercase">MUZSPORTS ANALİTİK</h3>
              </div>
              <AIAnalytics matches={matches} news={news} />

              <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">SİSTEM NOTU</span>
                 </div>
                 <p className="text-[10px] font-bold text-white/40 leading-relaxed uppercase tracking-tight italic">
                   Canlı veri akışı P2P Mesh ağı üzerinden tüm cihazlarla senkronize edilmektedir. Gecikme: &lt;50ms
                 </p>
              </div>
           </div>
        </div>
      </main>

      {/* Persistent Status Footer */}
      <footer className="h-8 bg-primary flex items-center px-6 justify-between text-[10px] font-black text-black uppercase tracking-widest shrink-0 shadow-[0_-4px_20px_rgba(132,204,22,0.2)] z-50">
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"/> VERİ AKIŞI: AKTİF</span>
          <span className="hidden sm:inline">BAĞLI SUNUCU: P2P MESH NET</span>
          <span className="hidden md:inline">FORUM: SENKRONİZE</span>
        </div>
        <div className="flex gap-8">
          <span className="hidden lg:inline">AKTİF KULLANICI: 1,284</span>
          <span>SİSTEM ZAMANI: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
