import React, { useState, useEffect, useMemo } from 'react';
import { Match } from '@/types';
import { p2p } from '@/lib/p2p';
import { ai } from '@/lib/ai';
import { dataService } from '@/lib/data';
import { clsx } from 'clsx';
import { Activity, Clock, Zap, TrendingUp } from 'lucide-react';

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
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub = p2p.subscribe((msg) => {
      if (msg.type === 'MATCH_UPDATE') {
        setMatches(prev => prev.map(m => m.id === msg.payload.id ? { ...m, ...msg.payload } : m));
        if (selectedMatch?.id === msg.payload.id) {
          setSelectedMatch(prev => prev ? { ...prev, ...msg.payload } : null);
        }
      }
    });
    return () => { unsub(); };
  }, [selectedMatch]);

  const prediction = useMemo(() => {
    if (!selectedMatch) return '';
    return ai.predictMatch(selectedMatch.homeTeam, selectedMatch.awayTeam);
  }, [selectedMatch?.id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!selectedMatch && matches.length === 0) return (
     <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <h2 className="text-xl font-bold mb-2">Canlı Maç Bulunamadı</h2>
        <p className="text-white/40">Şu an oynanan aktif bir lig maçı bulunmuyor.</p>
     </div>
  );

  const currentMatch = selectedMatch || matches[0];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <aside className="w-full lg:w-80 border-r border-white/5 flex flex-col bg-background-inner">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xs font-black tracking-widest text-white/40 uppercase">Maçlar ({matches.length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matches.map(match => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className={clsx(
                "w-full p-6 flex flex-col gap-4 transition-all border-b border-white/5 text-left",
                currentMatch.id === match.id ? "bg-primary/5 border-r-2 border-r-primary" : "hover:bg-white/5"
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/30 tracking-tight">{match.league}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter truncate max-w-[100px]">{match.time}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className={clsx("font-bold text-sm", currentMatch.id === match.id ? "text-white" : "text-white/60")}>{match.homeTeam}</span>
                  <span className="font-mono font-black text-lg">{match.homeScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={clsx("font-bold text-sm", currentMatch.id === match.id ? "text-white" : "text-white/60")}>{match.awayTeam}</span>
                  <span className="font-mono font-black text-lg">{match.awayScore}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8">
        <div className="flex flex-col items-center gap-2 mb-10">
          <div className="text-xs font-black tracking-[0.2em] text-primary mb-4 uppercase">{currentMatch.league}</div>
          <div className="flex items-center justify-center gap-4 lg:gap-16 w-full max-w-4xl">
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">⚽</div>
              <div className="text-center">
                <div className="text-xl lg:text-3xl font-black uppercase tracking-tighter">{currentMatch.homeTeam}</div>
                <div className="text-[10px] font-bold text-white/30 tracking-widest mt-1 uppercase">EV SAHİBİ</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
               <div className="bg-background-card border border-white/10 rounded-2xl p-6 lg:p-8 flex items-center gap-6 lg:gap-10 shadow-2xl">
                  <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter">{currentMatch.homeScore}</span>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-primary font-black text-center text-[10px] lg:text-sm leading-tight max-w-[100px]">{currentMatch.time}</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse mt-1" />
                  </div>
                  <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter">{currentMatch.awayScore}</span>
               </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">🏆</div>
              <div className="text-center">
                <div className="text-xl lg:text-3xl font-black uppercase tracking-tighter">{currentMatch.awayTeam}</div>
                <div className="text-[10px] font-bold text-white/30 tracking-widest mt-1 uppercase">DEPLASMAN</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <div className="glass-panel p-8">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="text-primary" size={20} />
              <h3 className="font-black text-xs tracking-widest uppercase">CANLI İSTATİSTİKLER</h3>
            </div>
            <div className="space-y-8">
              {Object.entries(currentMatch.stats).map(([key, [home, away]]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black tracking-widest text-white/40 uppercase">
                    <span>{home}{key === 'possession' ? '%' : ''}</span>
                    <span>{key === 'possession' ? 'TOPLA OYNAMA' : key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                    <span>{away}{key === 'possession' ? '%' : ''}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary" style={{ width: `${(home || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                    <div className="h-full bg-white/10" style={{ width: `${(away || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-[10px] text-white/20 font-bold uppercase text-center italic border-t border-white/5 pt-6">
              ESPN Veri Kaynağından Anlık Güncellenmektedir
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} className="text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-primary" size={20} />
                <h3 className="font-black text-xs tracking-widest text-primary uppercase">AI ÖN TAHMİNİ</h3>
              </div>
              <p className="text-sm font-medium leading-relaxed text-white/90">
                {prediction}
              </p>
            </div>

            <div className="glass-panel p-8">
               <div className="flex items-center gap-3 mb-8">
                <Clock className="text-primary" size={20} />
                <h3 className="font-black text-xs tracking-widest uppercase">ANLIK ANLATIM</h3>
              </div>
              <div className="space-y-6">
                {currentMatch.events.length > 0 ? currentMatch.events.slice().reverse().map(event => (
                  <div key={event.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background-inner border border-white/5 flex items-center justify-center shrink-0 text-[10px] font-black text-primary">
                      {event.minute}'
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                          {event.type === 'goal' ? 'GOAL' : 'INFO'} • {event.team === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-white/20">
                     <Clock size={32} className="mb-2 opacity-20" />
                     <p className="text-[10px] font-bold uppercase tracking-widest">Henüz önemli bir olay yok</p>
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
