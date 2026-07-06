import React from 'react';
import { Match } from '../types';
import { clsx } from 'clsx';
import { Activity, Brain } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  selectedMatchId?: string;
  onSelectMatch: (match: Match) => void;
}

const MatchList: React.FC<MatchListProps> = ({ matches, selectedMatchId, onSelectMatch }) => {
  return (
    <div className="flex flex-col h-full bg-background-inner/30 border-r border-white/5 overflow-hidden stadium-grid">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-background/50 backdrop-blur-xl">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">TRİBÜN AKIŞI</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-neon" />
             <span className="text-[9px] font-black text-primary uppercase tracking-widest">{matches.length} CANLI MAÇ</span>
          </div>
        </div>
        <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
           <Activity size={16} className="text-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {matches.map(match => (
          <button
            key={match.id}
            onClick={() => onSelectMatch(match)}
            className={clsx(
              "w-full p-8 flex flex-col gap-6 transition-all border-b border-white/5 text-left group relative",
              selectedMatchId === match.id ? "bg-primary/5" : "hover:bg-white/[0.01]"
            )}
          >
            {selectedMatchId === match.id && (
              <>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-neon" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary/5 to-transparent" />
              </>
            )}

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">{match.league}</span>
                 {match.aiSummary && (
                   <div className="flex items-center gap-1 text-primary scale-75 origin-left">
                     <Brain size={10} />
                     <span className="text-[8px] font-black">AI</span>
                   </div>
                 )}
              </div>
              <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-white/5 shadow-inner">
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter tabular-nums">{match.time}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/5 p-1 border border-white/5 flex items-center justify-center">
                    <img src={match.homeLogo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className={clsx("font-black text-xs tracking-tight uppercase", selectedMatchId === match.id ? "text-white" : "text-white/40 group-hover:text-white/60")}>{match.homeTeam}</span>
                </div>
                <span className={clsx("font-mono font-black text-xl tabular-nums", selectedMatchId === match.id ? "text-primary" : "text-white/80")}>{match.homeScore}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-white/5 p-1 border border-white/5 flex items-center justify-center">
                    <img src={match.awayLogo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className={clsx("font-black text-xs tracking-tight uppercase", selectedMatchId === match.id ? "text-white" : "text-white/40 group-hover:text-white/60")}>{match.awayTeam}</span>
                </div>
                <span className={clsx("font-mono font-black text-xl tabular-nums", selectedMatchId === match.id ? "text-primary" : "text-white/80")}>{match.awayScore}</span>
              </div>
            </div>

            {selectedMatchId === match.id && (
               <div className="mt-2 flex gap-1 items-center">
                  <div className="flex-1 h-0.5 bg-primary/20 rounded-full overflow-hidden">
                     <div className="h-full bg-primary animate-stadium-scan bg-[length:200%_100%] shadow-neon" />
                  </div>
               </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MatchList;
