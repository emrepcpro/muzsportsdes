import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, BarChart3, Zap, ShieldCheck } from 'lucide-react';
import { Match, NewsArticle } from '@/types';
import { ai } from '@/lib/ai';
import { storage } from '@/lib/storage';
import { clsx } from 'clsx';

const AIAnalytics: React.FC<{ matches: Match[]; news: NewsArticle[] }> = ({ matches, news }) => {
  const [analysis, setAnalysis] = useState<string>('Analiz ediliyor...');
  const [isAnalyzing, setIsAnalysis] = useState(true);

  useEffect(() => {
    const runGlobalAnalysis = async () => {
      setIsAnalysis(true);
      // Simulate deep data analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const liveMatches = matches.filter(m => m.status === 'live').length;
      const topNews = news[0]?.title || 'spor gündemi';

      setAnalysis(`Şu an ${liveMatches} maç canlı olarak takip ediliyor. "${topNews}" başlığı spor dünyasında en çok konuşulan konu. AI verilerine göre bu hafta sürpriz sonuçlar beklenebilir.`);
      setIsAnalysis(false);
    };
    runGlobalAnalysis();
  }, [matches.length, news.length]);

  const [dataAgingDays, setDataAgingDays] = useState(storage.get('ai_aging_days', 30));
  const [isAgingEnabled, setIsAgingEnabled] = useState(storage.get('ai_aging_enabled', true));

  useEffect(() => {
    storage.set('ai_aging_days', dataAgingDays);
  }, [dataAgingDays]);

  useEffect(() => {
    storage.set('ai_aging_enabled', isAgingEnabled);
  }, [isAgingEnabled]);

  return (
    <div className="glass-panel p-8 space-y-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
        <Brain size={120} className="text-primary" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-neon">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black italic tracking-tighter">AI ANALİTİK PANELİ</h2>
          <p className="text-[9px] font-black tracking-[0.3em] text-primary uppercase">Real-Time Data Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="bg-background-inner/50 border border-white/5 p-6 rounded-2xl space-y-4 shadow-inner">
           <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Trend Analizi</span>
           </div>
           <p className="text-sm font-bold text-white/70 leading-relaxed italic">
             {isAnalyzing ? 'Veriler taranıyor...' : analysis}
           </p>
        </div>

        <div className="bg-background-inner/50 border border-white/5 p-6 rounded-2xl space-y-4 shadow-inner group/card hover:border-primary/30 transition-colors">
           <div className="flex items-center gap-2 text-primary">
              <Zap size={16} className="group-hover/card:animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Maç Ön Tahminleri</span>
           </div>
           <div className="space-y-3">
             {matches.length > 0 ? matches.slice(0, 3).map(m => (
               <div key={m.id} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                     <span className="text-white/60 truncate max-w-[120px]">{m.homeTeam} - {m.awayTeam}</span>
                     <span className="text-primary font-black italic">%{Math.floor(Math.random() * 20) + 60} Güven</span>
                  </div>
                  <div className="text-[9px] text-white/30 font-bold uppercase truncate">{ai.predictMatch(m.homeTeam, m.awayTeam).split('Tahmin:')[1] || 'ANALİZ EDİLİYOR'}</div>
               </div>
             )) : (
               <div className="text-[10px] font-bold text-white/20 italic">Aktif maç verisi bekleniyor...</div>
             )}
           </div>
        </div>

        <div className="bg-background-inner/50 border border-white/5 p-6 rounded-2xl space-y-4 shadow-inner">
           <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Sistem Güvenliği</span>
           </div>
           <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold">
                 <span className="text-white/40">P2P Mesh</span>
                 <span className="text-primary tracking-tighter">AKTİF</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-1">
                 <div className="w-[95%] h-full bg-primary rounded-full shadow-neon" />
              </div>
           </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col lg:flex-row lg:items-center justify-between border-t border-white/5 relative z-10 gap-6">
         <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
               <BarChart3 size={14} className="text-white/20" />
               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">1.2M Veri Noktası/Sn</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
               <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Veri Yaşlandırma (AI Özet)</span>
               <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAgingEnabled(!isAgingEnabled)}
                    className={clsx("w-8 h-4 rounded-full relative transition-all", isAgingEnabled ? "bg-primary" : "bg-white/10")}
                  >
                    <div className={clsx("absolute top-1 w-2 h-2 rounded-full bg-black transition-all", isAgingEnabled ? "right-1" : "left-1")} />
                  </button>
                  <select
                    value={dataAgingDays}
                    onChange={(e) => setDataAgingDays(Number(e.target.value))}
                    className="bg-transparent text-[10px] font-black text-primary outline-none border-none cursor-pointer"
                  >
                    <option value={7}>7 GÜN</option>
                    <option value={15}>15 GÜN</option>
                    <option value={30}>30 GÜN</option>
                    <option value={60}>60 GÜN</option>
                  </select>
               </div>
            </div>
         </div>
         <button className="text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest bg-primary/10 px-6 py-2 rounded-xl border border-primary/20">Derin Analizi Aç</button>
      </div>
    </div>
  );
};

export default AIAnalytics;
