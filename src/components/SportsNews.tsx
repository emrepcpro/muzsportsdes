import React, { useState, useEffect } from 'react';
import { Calendar, Brain, ChevronRight, ExternalLink, Sparkles, Filter, Search, Clock } from 'lucide-react';
import { ai } from '../lib/ai';
import { dataService } from '../lib/data';
import { NewsArticle } from '../types';
import { clsx } from 'clsx';

const SportsNews: React.FC<{ onNewsUpdate?: (news: NewsArticle[]) => void }> = ({ onNewsUpdate }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await dataService.getNews();
      const processed = await Promise.all(data.map(async (art: NewsArticle) => {
        if (ai.shouldSummarize(art.date)) {
           const summary = await ai.summarize(art.content);
           return { ...art, content: summary, isAiSummarized: true };
        }
        return { ...art, isAiSummarized: false };
      }));
      setNews(processed);
      if (onNewsUpdate) onNewsUpdate(processed);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredNews = filter === 'all' ? news : news.filter(n => filter === 'ai' ? n.isAiSummarized : !n.isAiSummarized);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-neon" />
        <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">VERİ AKIŞI ÇEKİLİYOR...</span>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-16 max-w-7xl mx-auto stadium-grid h-full overflow-y-auto custom-scrollbar">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-gradient uppercase">HABER MERKEZİ</h1>
          <p className="text-primary font-black mt-3 uppercase text-[10px] tracking-[0.4em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            GÜNCEL ESPN GLOBAL VERİ AKIŞI • {news.length} MAKALE
          </p>
        </div>

        <div className="flex items-center gap-4 bg-background-inner/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
           {[
             { id: 'all', label: 'TÜMÜ', icon: Filter },
             { id: 'latest', label: 'GÜNCEL', icon: Clock },
             { id: 'ai', label: 'AI ARŞİV', icon: Brain },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setFilter(item.id)}
               className={clsx(
                 "flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase",
                 filter === item.id ? "bg-primary text-black shadow-neon" : "text-white/40 hover:text-white hover:bg-white/5"
               )}
             >
               <item.icon size={14} strokeWidth={3} />
               {item.label}
             </button>
           ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {filteredNews.map(article => (
          <div
            key={article.id}
            className={clsx(
              "glass-panel group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:glass-panel-active",
              article.isAiSummarized ? "border-primary/20 bg-primary/[0.03]" : ""
            )}
          >
            {article.isAiSummarized && (
              <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-primary text-black px-4 py-1.5 rounded-full shadow-neon animate-neon">
                <Brain size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter">AI OPTİMİZE</span>
              </div>
            )}

            {article.image && (
              <div className="h-64 overflow-hidden relative border-b border-white/5">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-card via-transparent to-transparent" />
              </div>
            )}

            <div className="p-10 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">{article.category}</span>
                <span className="text-white/5 font-black text-xl">/</span>
                <div className="flex items-center gap-2 text-white/30">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black tracking-widest">{new Date(article.date).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight leading-[1.1] group-hover:text-primary transition-colors uppercase italic">{article.title}</h2>
              <p className="text-sm text-white/50 font-bold leading-relaxed italic border-l-2 border-white/5 pl-6">{article.summary}</p>

              <div className={clsx(
                "p-6 rounded-2xl text-[11px] leading-relaxed relative overflow-hidden",
                article.isAiSummarized
                  ? "bg-black/60 border border-primary/20 font-mono text-primary/90 shadow-inner italic"
                  : "bg-white/5 border border-white/5 text-white/70"
              )}>
                {article.isAiSummarized && <div className="absolute -top-10 -right-10 opacity-5"><Sparkles size={100} /></div>}
                {article.content}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <button className="flex items-center gap-3 text-[10px] font-black text-primary hover:gap-5 transition-all uppercase tracking-[0.2em] group/btn">
                  HABERİN TAMAMI <ChevronRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
                <div className="flex gap-4">
                  <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-primary hover:bg-primary/10 transition-all border border-white/5">
                    <ExternalLink size={18} />
                  </button>
                  <button className="p-3 bg-white/5 rounded-xl text-white/20 hover:text-white transition-all border border-white/5">
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI System Note */}
      <div className="mt-20 glass-panel p-12 flex flex-col lg:flex-row items-center gap-12 border-primary/20 bg-primary/[0.03]">
         <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-black shadow-neon-strong shrink-0">
           <Sparkles size={48} strokeWidth={2.5} />
         </div>
         <div className="flex-1 space-y-4 text-center lg:text-left">
           <h3 className="text-3xl font-black italic tracking-tighter uppercase">AKILLI ARŞİVLEME SİSTEMİ</h3>
           <p className="text-white/60 font-bold leading-relaxed uppercase text-xs tracking-widest">
             MuzSports AI, 30 günü geçen tüm içerikleri otomatik olarak tarar, gereksiz verileri ayıklar ve size en saf halini sunar.
             <span className="text-primary block mt-2 italic">Daha hızlı, daha hafif, daha akıllı spor deneyimi.</span>
           </p>
         </div>
         <button
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="btn-primary"
         >
           AYARLARI YÖNET
         </button>
      </div>
    </div>
  );
};

export default SportsNews;
