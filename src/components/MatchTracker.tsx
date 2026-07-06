import React, { useState, useEffect, useMemo } from 'react';
import { Match } from '@/types';
import { p2p } from '@/lib/p2p';
import { ai } from '@/lib/ai';
import { dataService } from '@/lib/data';
import { clsx } from 'clsx';
import { Activity, Clock, Zap, TrendingUp, ChevronRight, Trophy } from 'lucide-react';

const MatchTracker: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const data = await dataService.getLiveScores();
    setMatches(data);
    setLoading(false);
    if (data.length > 0 && !selectedMatch) {
      setSelectedMatch(data[0]);
    }
    p2p.broadcast('MATCH_SYNC', { matches: data });
  };

  useEffect(() => {
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

    fetchData();
    const interval = setInterval(fetchData, 30000); // More frequent updates
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [selectedMatch]);

  const prediction = useMemo(() => {
    if (!selectedMatch) return '';
    return ai.predictMatch(selectedMatch.homeTeam, selectedMatch.awayTeam);
  }, [selectedMatch?.id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background">
       <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-black italic text-primary text-xs">MS</div>
       </div>
    </div>
  );

  if (matches.length === 0) return (
     <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-background">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
           <Trophy size={40} className="text-white/10" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">CANLI MAÇ BULUNAMADI</h2>
        <p className="text-white/40 text-sm max-w-xs">Şu an oynanan aktif bir lig maçı bulunmuyor. Daha sonra tekrar kontrol edin.</p>
     </div>
  );

  const currentMatch = selectedMatch || matches[0];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-96 border-r border-white/5 flex flex-col bg-background-inner overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-xs font-black tracking-[0.2em] text-white/30 uppercase">AKTİF MAÇLAR</h2>
            <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">{matches.length} MAÇ CANLI</span>
          </div>
          <Activity size={18} className="text-primary animate-pulse" />
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {matches.map(match => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className={clsx(
                "w-full p-8 flex flex-col gap-5 transition-all border-b border-white/5 text-left group relative",
                currentMatch.id === match.id ? "bg-primary/5 shadow-inner" : "hover:bg-white/[0.02]"
              )}
            >
              {currentMatch.id === match.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-neon" />}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-white/30 tracking-widest uppercase">{match.league}</span>
                <div className="flex items-center gap-2 bg-background px-2 py-0.5 rounded border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter truncate max-w-[80px]">{match.time}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={match.homeLogo} alt="" className="w-5 h-5 object-contain" />
                    <span className={clsx("font-bold text-sm tracking-tight", currentMatch.id === match.id ? "text-white" : "text-white/60")}>{match.homeTeam}</span>
                  </div>
                  <span className="font-mono font-black text-xl">{match.homeScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={match.awayLogo} alt="" className="w-5 h-5 object-contain" />
                    <span className={clsx("font-bold text-sm tracking-tight", currentMatch.id === match.id ? "text-white" : "text-white/60")}>{match.awayTeam}</span>
                  </div>
                  <span className="font-mono font-black text-xl">{match.awayScore}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Scoreboard */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10 custom-scrollbar bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-1 rounded-full border border-white/5">
             <Trophy size={14} className="text-primary" />
             <span className="text-[10px] font-black tracking-[0.3em] text-white/50 uppercase">{currentMatch.league}</span>
          </div>

          <div className="flex items-center justify-between w-full max-w-5xl px-4 lg:px-0">
            <div className="flex flex-col items-center gap-6 flex-1">
              <div className="w-24 h-24 lg:w-40 lg:h-40 rounded-[2rem] bg-white/5 border border-white/5 p-6 flex items-center justify-center shadow-stadium stadium-border group">
                <img src={currentMatch.homeLogo} alt={currentMatch.homeTeam} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-5xl font-black uppercase tracking-tighter text-gradient">{currentMatch.homeTeam}</div>
                <div className="text-[10px] font-black text-white/20 tracking-[0.4em] mt-2 uppercase">EV SAHİBİ</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
               <div className="bg-background-card/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 lg:p-14 flex items-center gap-10 lg:gap-16 shadow-stadium relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                  <span className="text-7xl lg:text-9xl font-mono font-black tracking-tighter text-white relative z-10">{currentMatch.homeScore}</span>
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <span className="text-primary font-black text-sm lg:text-2xl tracking-tighter text-center uppercase">{currentMatch.time}</span>
                    <div className="w-3 h-3 rounded-full bg-primary animate-neon mt-2" />
                  </div>
                  <span className="text-7xl lg:text-9xl font-mono font-black tracking-tighter text-white relative z-10">{currentMatch.awayScore}</span>
               </div>
               <div className="flex gap-4">
                  <button className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">İDDAA ORANLARI</button>
                  <button className="px-6 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all">TAKIM KADROLARI</button>
               </div>
            </div>

            <div className="flex flex-col items-center gap-6 flex-1">
              <div className="w-24 h-24 lg:w-40 lg:h-40 rounded-[2rem] bg-white/5 border border-white/5 p-6 flex items-center justify-center shadow-stadium stadium-border group">
                <img src={currentMatch.awayLogo} alt={currentMatch.awayTeam} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-5xl font-black uppercase tracking-tighter text-gradient">{currentMatch.awayTeam}</div>
                <div className="text-[10px] font-black text-white/20 tracking-[0.4em] mt-2 uppercase">DEPLASMAN</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="glass-panel p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} className="text-white" />
            </div>
            <div className="flex items-center gap-3 mb-10 relative z-10">
              <div className="w-1.5 h-6 bg-primary rounded-full shadow-neon" />
              <h3 className="font-black text-xs tracking-[0.2em] uppercase">CANLI İSTATİSTİKLER</h3>
            </div>

            <div className="space-y-10 relative z-10">
              {Object.entries(currentMatch.stats).map(([key, [home, away]]) => (
                <div key={key} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black tracking-widest text-white/30 uppercase">
                    <span className={home > away ? "text-primary" : ""}>{home}{key === 'possession' ? '%' : ''}</span>
                    <span>{key === 'possession' ? 'TOPLA OYNAMA' : key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                    <span className={away > home ? "text-primary" : ""}>{away}{key === 'possession' ? '%' : ''}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden flex stadium-border">
                    <div className="h-full bg-primary shadow-neon transition-all duration-1000" style={{ width: `${(home || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                    <div className="h-full bg-white/10 transition-all duration-1000" style={{ width: `${(away || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-[9px] text-white/10 font-black uppercase text-center italic border-t border-white/5 pt-8 tracking-widest">
              LIVE DATA STREAM BY ESPN • UPDATED EVERY 60S
            </div>
          </div>

          <div className="space-y-10">
            {/* AI Predictions */}
            <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-10 relative overflow-hidden group shadow-neon transition-all hover:scale-[1.02]">
              <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={240} className="text-primary" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary text-black rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-widest text-primary uppercase">MUZSPORTS AI ANALİZİ</h3>
                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-tighter">GÜNCEL TAHMİN VERİSİ</p>
                </div>
              </div>
              <p className="text-lg font-bold leading-relaxed text-white/90 italic tracking-tight">
                "{prediction}"
              </p>
            </div>

            {/* Commentary */}
            <div className="glass-panel p-10">
               <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-6 bg-primary rounded-full shadow-neon" />
                <h3 className="font-black text-xs tracking-[0.2em] uppercase">MAÇ ANLATIMI</h3>
              </div>
              <div className="space-y-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                {currentMatch.events.length > 0 ? currentMatch.events.slice().reverse().map((event, idx) => (
                  <div key={event.id || idx} className="flex gap-6 animate-in slide-in-from-bottom-4">
                    <div className="w-12 h-12 rounded-2xl bg-background-inner border border-white/5 flex items-center justify-center shrink-0 text-xs font-black text-primary shadow-inner">
                      {event.minute}'
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          event.type === 'goal' ? "bg-primary text-black" : "bg-white/10 text-white/50"
                        )}>
                          {event.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-bold leading-relaxed text-white/70 tracking-tight">{event.description}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-20 text-white/10 border-2 border-dashed border-white/5 rounded-[2rem]">
                     <Clock size={48} className="mb-4 opacity-10" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em]">Henüz önemli bir olay yok</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchTracker;
