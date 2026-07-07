import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import MatchTracker from './components/MatchTracker';
import MuzCafes from './components/MuzCafes';
import ServerlessForum from './components/ServerlessForum';
import SportsNews from './components/SportsNews';
import { storage } from './lib/storage';
import { ai } from './lib/ai';
import { p2p } from './lib/p2p';
import AISettings from './components/AISettings';
import { Sparkles, Radio, MessageSquare, Coffee, Newspaper, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('maçlar');
  const [aiEnabled, setAiEnabled] = useState(storage.get('ai_enabled', true));
  const [agingDays, setAgingDays] = useState(storage.get('ai_aging_days', 30));
  const [aiProvider, setAiProvider] = useState(storage.get('ai_provider', 'local'));
  const [livePulse, setLivePulse] = useState(0);

  useEffect(() => {
    storage.set('ai_enabled', aiEnabled);
  }, [aiEnabled]);

  useEffect(() => {
    storage.set('ai_aging_days', agingDays);
  }, [agingDays]);

  useEffect(() => {
    const interval = window.setInterval(() => setLivePulse((v) => (v + 1) % 4), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub: any = p2p.subscribe((msg: any) => {
      if (msg.type === 'AI_SETTINGS') {
        setAiEnabled(msg.payload.enabled);
        setAgingDays(msg.payload.agingDays);
      } else if (msg.type === 'AI_PROVIDER') {
        setAiProvider(msg.payload.provider);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    p2p.broadcast('AI_SETTINGS', { enabled: aiEnabled, agingDays });
  }, [aiEnabled, agingDays]);

  useEffect(() => {
    storage.set('ai_provider', aiProvider);
    p2p.broadcast('AI_PROVIDER', { provider: aiProvider });
  }, [aiProvider]);

  const renderContent = () => {
    switch (activeTab) {
      case 'maçlar':
        return <MatchTracker />;
      case 'forum':
        return <ServerlessForum />;
      case 'muzcafe':
        return <MuzCafes />;
      case 'haberler':
        return <SportsNews aiEnabled={aiEnabled} agingDays={agingDays} />;
      default:
        return <MatchTracker />;
    }
  };

  const insights = useMemo(() => [
    { label: 'Canlı Veri Akışı', value: 'Aktif', icon: Radio },
    { label: 'Forum', value: 'Senkron', icon: MessageSquare },
    { label: 'Kafe Odaları', value: 'Açık', icon: Coffee },
    { label: 'AI Özet', value: aiEnabled ? 'Açık' : 'Kapalı', icon: Sparkles },
  ], [aiEnabled]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-black">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(239,68,68,0.08),_transparent_40%)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
          <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-primary/10 bg-background-card/90 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 text-primary">
                <Trophy size={18} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">MuzSports Command Center</span>
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tighter text-white sm:text-4xl">
                Canlı skorlar, haber akışı ve P2P kafe deneyimi tek ekranda.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Sunucusuz, lokal senkronizasyonlu, mobil/masaüstü uyumlu bu platformda maçlar, forum ve odalar gerçek zamanlı ilerliyor.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-background-inner/80 p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Sistem Durumu</span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  {livePulse % 2 === 0 ? 'Çevrimiçi' : 'Senkron'}
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {insights.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <item.icon size={16} className="text-primary" />
                      {item.label}
                    </div>
                    <span className="text-sm font-semibold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-background-card/80">
              {renderContent()}
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-primary/10 bg-background-card/90 p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.25em]">AI Panel</span>
                </div>
                <h2 className="mt-3 text-xl font-black tracking-tight text-white">Akıllı özet, tahmin ve anlık öngörü.</h2>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Eski haber ve maç verileri belirlediğiniz gün aralığında özetlenir, canlı skorlar daha net bir çerçevede sunulur.
                </p>
                <AISettings
                  enabled={aiEnabled}
                  agingDays={agingDays}
                  onEnabledChange={setAiEnabled}
                  onAgingDaysChange={setAgingDays}
                />
              </div>
              <div className="rounded-3xl border border-white/10 bg-background-inner/80 p-6 text-sm leading-7 text-white/60">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Öne çıkan akışlar</h3>
                <ul className="mt-4 space-y-3">
                  <li>• P2P forum mesajları tüm açık sekmelerde anlık senkronize olur.</li>
                  <li>• Kafe odaları ekran paylaşımı, kamera ve taktik tahtası ile işlevsel kalır.</li>
                  <li>• Mobil ve masaüstü sürümler için yerel kalıcılık korunur.</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="h-10 border-t border-white/10 bg-background/90 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 shrink-0">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
          <span>Veri Akışı: Aktif</span>
          <span>Bağlı Sunucu: P2P Mesh</span>
          <span>Forum Durumu: Senkronize</span>
          <span>Sistem Zamanı: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
