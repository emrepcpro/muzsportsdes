import React from 'react';
import { Match } from '@/types';
import { clsx } from 'clsx';
import { Trophy, Activity, Zap, TrendingUp, Sparkles, Clock } from 'lucide-react';
import { ai } from '@/lib/ai';

interface MatchDetailProps {
  match: Match | null;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match }) => {
  if (!match) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-background">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
        <Trophy size={32} className="text-white/10" />
      </div>
      <h2 className="text-xl font-black mb-2 tracking-tight">MAÇ SEÇİLMEDİ</h2>
      <p className="text-white/40 text-xs max-w-xs uppercase tracking-widest font-bold">Detayları görmek için soldan bir maç seçin.</p>
    </div>
  );

  const prediction = ai.predictMatch(match.homeTeam, match.awayTeam);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 space-y-10">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
           <Trophy size={12} className="text-primary" />
           <span className="text-[9px] font-black tracking-[0.3em] text-white/50 uppercase">{match.league}</span>
        </div>

        <div className="flex items-center justify-between w-full max-w-4xl px-4 lg:px-0">
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-3xl bg-white/5 border border-white/5 p-4 flex items-center justify-center shadow-stadium group">
              <img src={match.homeLogo} alt={match.homeTeam} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="text-center">
              <div className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-gradient">{match.homeTeam}</div>
              <div className="text-[8px] font-black text-white/20 tracking-[0.4em] mt-1 uppercase">EV SAHİBİ</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
             <div className="bg-background-card border border-white/10 rounded-[2rem] p-6 lg:p-10 flex items-center gap-8 lg:gap-12 shadow-stadium relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
                <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter text-white relative z-10">{match.homeScore}</span>
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <span className="text-primary font-black text-xs lg:text-xl tracking-tighter text-center uppercase">{match.time}</span>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <span className="text-5xl lg:text-7xl font-mono font-black tracking-tighter text-white relative z-10">{match.awayScore}</span>
             </div>
          </div>

          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-3xl bg-white/5 border border-white/5 p-4 flex items-center justify-center shadow-stadium group">
              <img src={match.awayLogo} alt={match.awayTeam} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="text-center">
              <div className="text-xl lg:text-3xl font-black uppercase tracking-tighter text-gradient">{match.awayTeam}</div>
              <div className="text-[8px] font-black text-white/20 tracking-[0.4em] mt-1 uppercase">DEPLASMAN</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="glass-panel p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-5 bg-primary rounded-full shadow-neon" />
            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">CANLI İSTATİSTİKLER</h3>
          </div>

          <div className="space-y-8">
            {Object.entries(match.stats).map(([key, [home, away]]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black tracking-widest text-white/30 uppercase">
                  <span className={home > away ? "text-primary" : ""}>{home}{key === 'possession' ? '%' : ''}</span>
                  <span>{key === 'possession' ? 'TOPLA OYNAMA' : key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                  <span className={away > home ? "text-primary" : ""}>{away}{key === 'possession' ? '%' : ''}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary shadow-neon transition-all duration-1000" style={{ width: `${(home || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                  <div className="h-full bg-white/10 transition-all duration-1000" style={{ width: `${(away || 1) / ((home || 1) + (away || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 relative overflow-hidden group transition-all hover:border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary text-black rounded-lg">
                <TrendingUp size={16} />
              </div>
              <h3 className="font-black text-[10px] tracking-widest text-primary uppercase">MUZSPORTS AI ANALİZİ</h3>
            </div>
            <p className="text-sm font-bold leading-relaxed text-white/80 italic tracking-tight relative z-10">
              "{prediction}"
            </p>
          </div>

          <div className="glass-panel p-8">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-5 bg-primary rounded-full shadow-neon" />
                <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">{match.aiSummary ? 'AI MAÇ ÖZETİ' : 'MAÇ ANLATIMI'}</h3>
             </div>

             {match.aiSummary ? (
                <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl space-y-3">
                   <div className="flex items-center gap-2 text-primary">
                      <Sparkles size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">ARŞİV ÖZETİ</span>
                   </div>
                   <p className="text-xs font-bold text-white/70 leading-relaxed italic">{match.aiSummary}</p>
                </div>
             ) : (
                <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                  {match.events.length > 0 ? match.events.slice().reverse().map((event, idx) => (
                    <div key={event.id || idx} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-background-inner border border-white/5 flex items-center justify-center shrink-0 text-[10px] font-black text-primary">
                        {event.minute}'
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className={clsx(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          event.type === 'goal' ? "bg-primary text-black" : "bg-white/10 text-white/50"
                        )}>
                          {event.type.toUpperCase()}
                        </span>
                        <p className="text-xs font-bold text-white/60 leading-tight">{event.description}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/10 border-2 border-dashed border-white/5 rounded-2xl">
                       <Clock size={32} className="mb-2 opacity-10" />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em]">Henüz olay yok</p>
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
