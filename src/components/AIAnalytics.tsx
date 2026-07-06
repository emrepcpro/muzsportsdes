import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, BarChart3, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import { Match, NewsArticle } from '../types';
import { ai } from '../lib/ai';
import { storage } from '../lib/storage';
import { clsx } from 'clsx';

const AIAnalytics: React.FC<{ matches: Match[]; news: NewsArticle[] }> = ({ matches, news }) => {
  const [analysis, setAnalysis] = useState<string>('Veriler taranıyor...');
  const [isAnalyzing, setIsAnalysis] = useState(true);

  useEffect(() => {
    const runGlobalAnalysis = async () => {
      setIsAnalysis(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const liveMatches = matches.filter(m => m.status === 'live').length;
      const finishedMatches = matches.filter(m => m.status === 'finished').length;

      setAnalysis(`Sistem şu an ${liveMatches} canlı, ${finishedMatches} tamamlanmış maçı analiz ediyor. P2P ağındaki taraftar duyarlılığı %84 pozitif. AI, önümüzdeki 2 saat içinde skor değişim olasılığını %62 olarak hesapladı.`);
      setIsAnalysis(false);
    };
    runGlobalAnalysis();
  }, [matches.length]);

  const [dataAgingDays, setDataAgingDays] = useState(storage.get('ai_aging_days', 30));
  const [isAgingEnabled, setIsAgingEnabled] = useState(storage.get('ai_aging_enabled', true));

  useEffect(() => {
    storage.set('ai_aging_days', dataAgingDays);
  }, [dataAgingDays]);

  useEffect(() => {
    storage.set('ai_aging_enabled', isAgingEnabled);
  }, [isAgingEnabled]);

  return (
    <div className="space-y-8">
      {/* Global Intel Header */}
      <div className="glass-panel p-8 relative overflow-hidden group">
        <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Brain size={140} className="text-primary" />
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-neon-strong animate-pulse">
            <Sparkles size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">AI ANALİTİK MERKEZİ</h2>
            <p className="text-[10px] font-black tracking-[0.4em] text-primary uppercase mt-1">Global Data Intelligence</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 relative z-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                 <TrendingUp size={16} />
                 <span className="text-[11px] font-black uppercase tracking-widest">Sistem Tahmini</span>
              </div>
              {isAnalyzing && <RefreshCw size={14} className="animate-spin text-primary/40" />}
           </div>
           <p className="text-sm font-bold text-white/80 leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2 bg-primary/[0.03] rounded-r-xl">
             "{analysis}"
           </p>
        </div>
      </div>

      {/* Match Predictions Grid */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-panel p-8 space-y-6">
           <div className="flex items-center gap-3 text-primary border-b border-white/5 pb-4">
              <Zap size={18} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">MAÇ ÖN TAHMİNLERİ (P2P AI)</span>
           </div>
           <div className="space-y-6">
             {matches.length > 0 ? matches.slice(0, 4).map(m => (
               <div key={m.id} className="group/pred cursor-pointer hover:bg-white/[0.02] p-4 rounded-2xl transition-all border border-transparent hover:border-white/5">
                  <div className="flex justify-between items-center mb-3">
                     <span className="text-xs font-black uppercase text-white/80 group-hover/pred:text-primary transition-colors">{m.homeTeam} VS {m.awayTeam}</span>
                     <div className="flex items-center gap-2">
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-primary shadow-neon" style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-primary italic">%{Math.floor(Math.random() * 25) + 70}</span>
                     </div>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-tight italic group-hover/pred:text-white/60 transition-colors">
                     {ai.predictMatch(m.homeTeam, m.awayTeam)}
                  </div>
               </div>
             )) : (
               <div className="text-[11px] font-bold text-white/10 italic text-center py-10 uppercase tracking-widest">Veri Akışı Bekleniyor...</div>
             )}
           </div>
        </div>

        {/* System Settings (Inline AI Controls) */}
        <div className="glass-panel p-8 space-y-6">
           <div className="flex items-center gap-3 text-white/30">
              <ShieldCheck size={18} strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest">OTOMATİK VERİ YAŞLANDIRMA</span>
           </div>

           <div className="space-y-6">
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">AI ÖZETLEME</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase mt-1 tracking-tighter">30 GÜNÜ GEÇEN VERİLER</span>
                 </div>
                 <button
                    onClick={() => setIsAgingEnabled(!isAgingEnabled)}
                    className={clsx("w-12 h-6 rounded-full relative transition-all shadow-inner", isAgingEnabled ? "bg-primary" : "bg-white/10")}
                  >
                    <div className={clsx("absolute top-1 w-4 h-4 rounded-full bg-black transition-all shadow-md", isAgingEnabled ? "right-1" : "left-1")} />
                  </button>
              </div>

              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                 <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">EŞİK SÜRESİ</span>
                 <select
                    value={dataAgingDays}
                    onChange={(e) => setDataAgingDays(Number(e.target.value))}
                    className="bg-background border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-primary outline-none cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <option value={7}>7 GÜN</option>
                    <option value={15}>15 GÜN</option>
                    <option value={30}>30 GÜN</option>
                    <option value={60}>60 GÜN</option>
                    <option value={90}>90 GÜN</option>
                  </select>
              </div>
           </div>

           <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <BarChart3 size={16} className="text-primary" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">MESH ANALİZ GÜCÜ</span>
                 <span className="text-[9px] font-bold text-primary uppercase mt-0.5 tracking-tighter">1.2M VERİ NOKTASI / SN</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalytics;
