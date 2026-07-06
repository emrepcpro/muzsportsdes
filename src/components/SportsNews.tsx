import React, { useState, useEffect } from 'react';
import { Calendar, Brain, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { ai } from '@/lib/ai';
import { dataService } from '@/lib/data';
import { NewsArticle } from '@/types';
import { clsx } from 'clsx';

const SportsNews: React.FC<{ onNewsUpdate?: (news: NewsArticle[]) => void }> = ({ onNewsUpdate }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dataService.getNews();
      const processed = await Promise.all(data.map(async (art: NewsArticle) => {
        if (ai.isOlderThan30Days(art.date)) {
           const summary = await ai.summarize(art.content);
           return { ...art, content: summary, isAiSummarized: true };
        }
        return art;
      }));
      setNews(processed);
      if (onNewsUpdate) onNewsUpdate(processed);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10"><div><h1 className="text-3xl font-black italic tracking-tighter text-gradient">HABERLER & ARŞİV</h1><p className="text-white/40 font-medium mt-1 uppercase text-[10px] tracking-widest">GÜNCEL ESPN VERİ AKIŞI</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map(article => (
          <div key={article.id} className={clsx("glass-panel group relative overflow-hidden transition-all hover:scale-[1.01]", article.isAiSummarized ? "border-primary/20 bg-primary/[0.02]" : "")}>
            {article.isAiSummarized && ( <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20"><Brain size={12} /><span className="text-[10px] font-black uppercase tracking-tighter">AI ÖZETİ</span></div> )}
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-2"><span className="text-[10px] font-black uppercase text-primary tracking-widest">{article.category}</span><span className="text-white/10">•</span><div className="flex items-center gap-1.5 text-white/40"><Calendar size={12} /><span className="text-[10px] font-bold">{new Date(article.date).toLocaleDateString()}</span></div></div>
              <h2 className="text-xl font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">{article.title}</h2>
              <p className="text-sm text-white/50 leading-relaxed italic">{article.summary}</p>
              <div className={clsx("p-4 rounded-xl text-sm leading-relaxed", article.isAiSummarized ? "bg-black/40 border border-white/5 font-mono text-primary/80" : "bg-white/5 border border-white/5 text-white/70")}>{article.content}</div>
              <div className="flex items-center justify-between pt-4"><button className="flex items-center gap-2 text-[10px] font-black text-primary hover:gap-3 transition-all uppercase tracking-widest">DEVAMINI OKU <ChevronRight size={14} /></button><button className="p-2 text-white/20 hover:text-white transition-colors"><ExternalLink size={16} /></button></div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-10">
         <div className="flex-1 space-y-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black"><Sparkles size={24} /></div><h3 className="text-2xl font-black italic tracking-tighter">AI PANELİ AKTİF</h3></div><p className="text-white/60 leading-relaxed">30 günü geçen tüm içerikleri otomatik olarak AI tarafından özetlenir.</p></div>
      </div>
    </div>
  );
};

export default SportsNews;
