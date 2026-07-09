import React, { useState, useEffect } from 'react';
import { Calendar, Brain, ChevronRight, ExternalLink, Sparkles, Plus, Search, Radio } from 'lucide-react';
import { ai } from '@/lib/ai';
import { dataService } from '@/lib/data';
import { NewsArticle } from '@/types';
import { clsx } from 'clsx';

interface SportsNewsProps {
  aiEnabled?: boolean;
  agingDays?: number;
}

const SportsNews: React.FC<SportsNewsProps> = ({ aiEnabled = true, agingDays = 30 }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customRssUrl, setCustomRssUrl] = useState('');
  const [customRssStatus, setCustomRssStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataService.getNews();
      const processed = await Promise.all(data.map(async (art: any) => {
        if (aiEnabled && ai.isOlderThanDays(art.date, agingDays)) {
           const summary = await ai.summarize(art.content);
           return { ...art, content: summary, isAiSummarized: true };
        }
        return art;
      }));
      setNews(processed);
    } catch (err) {
      setError('Haberler alınamadı');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [aiEnabled, agingDays]);

  const addCustomRssFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRssUrl) return;
    setCustomRssStatus('RSS feed yükleniyor...');

    try {
      const res = await fetch(customRssUrl);
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = xmlDoc.getElementsByTagName('item');

      const newArticles: any[] = [];
      for (let i = 0; i < Math.min(items.length, 3); i++) {
        const title = items[i].getElementsByTagName('title')[0]?.textContent || '';
        const desc = items[i].getElementsByTagName('description')[0]?.textContent || '';
        const pubDate = items[i].getElementsByTagName('pubDate')[0]?.textContent || '';

        if (title) {
          newArticles.push({
            id: `custom-rss-${Date.now()}-${i}`,
            title: title,
            summary: desc,
            content: desc,
            date: pubDate ? new Date(pubDate).getTime() : Date.now(),
            category: 'Custom RSS',
            source: 'Özel RSS Kaynağı',
            isAiSummarized: false,
          });
        }
      }

      if (newArticles.length > 0) {
        setNews(prev => [...newArticles, ...prev]);
        setCustomRssStatus(`Başarıyla ${newArticles.length} yeni haber eklendi!`);
        setCustomRssUrl('');
      } else {
        setCustomRssStatus('RSS feed geçerli haber öğeleri içermiyor.');
      }
    } catch (err) {
      setCustomRssStatus('RSS feed yüklenemedi. Tarayıcı CORS politikaları veya geçersiz URL sebebiyle olabilir.');
    }
  };

  const filteredNews = news.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-gradient">HABERLER & ARŞİV</h1>
          <p className="text-white/40 font-medium mt-1 uppercase text-[10px] tracking-widest">GÜNCEL ESPN API & RSS FEED AKIŞI</p>
        </div>

        {/* Searching */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Haberlerde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background-inner border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary/50 outline-none transition-all font-medium text-white/80"
          />
          <Search className="absolute left-4 top-3.5 text-white/30" size={16} />
        </div>
      </div>

      {/* Custom RSS Feeder */}
      <div className="glass-panel p-6 bg-gradient-to-r from-background-card to-background-highlight border-white/5 rounded-2xl">
        <h3 className="text-xs font-black tracking-widest text-primary uppercase mb-3 flex items-center gap-1.5">
          <Radio size={14} className="animate-pulse" /> ÖZEL RSS YAYIN AKIŞI EKLE
        </h3>
        <form onSubmit={addCustomRssFeed} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Örn: https://www.espn.com/espn/rss/news"
            value={customRssUrl}
            onChange={(e) => setCustomRssUrl(e.target.value)}
            required
            className="flex-1 bg-background-inner border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all font-medium"
          />
          <button type="submit" className="px-6 py-3 bg-primary text-black font-black text-xs tracking-widest rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shrink-0">
            <Plus size={14} /> RSS EKLE
          </button>
        </form>
        {customRssStatus && (
          <p className="text-[11px] font-bold text-primary mt-3 uppercase tracking-wider">{customRssStatus}</p>
        )}
      </div>

      {filteredNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center glass-panel py-20">
          <h2 className="text-xl font-bold mb-2">Aradığınız kriterde haber bulunamadı</h2>
          <p className="text-white/40 mb-4">Aramayı temizlemeyi veya yeni bir RSS yayını eklemeyi deneyin.</p>
          <button onClick={() => setSearchTerm('')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-xs font-black tracking-widest uppercase border border-white/10 rounded-xl">Aramayı Temizle</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredNews.map(article => (
            <div key={article.id} className={clsx("glass-panel group relative overflow-hidden transition-all hover:scale-[1.01] border border-white/5", article.isAiSummarized ? "border-primary/20 bg-primary/[0.01]" : "")}>
              {article.isAiSummarized && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20">
                  <Brain size={12} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">AI ÖZETİ</span>
                </div>
              )}
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2.5 py-1 rounded-md">{article.category}</span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">{article.source || 'ESPN'}</span>
                  <div className="flex items-center gap-1.5 text-white/40 ml-auto">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">{article.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed italic">{article.summary}</p>
                <div className={clsx("p-5 rounded-xl text-sm leading-relaxed", article.isAiSummarized ? "bg-black/40 border border-white/5 font-mono text-primary/80 shadow-inner" : "bg-white/5 border border-white/5 text-white/70")}>
                  {article.content}
                </div>
                <div className="flex items-center justify-between pt-4">
                  <button className="flex items-center gap-2 text-[10px] font-black text-primary hover:gap-3 transition-all uppercase tracking-widest">DEVAMINI OKU <ChevronRight size={14} /></button>
                  <button className="p-2 text-white/20 hover:text-white transition-colors"><ExternalLink size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-10 flex flex-col lg:flex-row items-center gap-10">
         <div className="flex-1 space-y-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black shadow-[0_0_15px_rgba(132,204,22,0.3)]">
               <Sparkles size={24} />
             </div>
             <h3 className="text-2xl font-black italic tracking-tighter uppercase">AI ANALİZ & ARŞİVLEME SİSTEMİ</h3>
           </div>
           <p className="text-white/60 leading-relaxed text-sm">
             {aiEnabled
               ? `${agingDays} günü geçmiş olan eski haberler ve arşivlenmiş içerikler yerel yapay zeka modülüyle sıkıştırılır ve veri kirliliği önlenir.`
               : 'Yapay zeka özetleme ve arşivleme şu an kapalı. Ana ekrandaki AI Panelinden aktif hale getirebilirsiniz.'}
           </p>
         </div>
      </div>
    </div>
  );
};

export default SportsNews;
