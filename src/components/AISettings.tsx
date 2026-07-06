import React, { useState, useEffect } from 'react';
import { Settings, Sparkles, Clock, Shield, Save, X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { clsx } from 'clsx';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISettings: React.FC<AISettingsProps> = ({ isOpen, onClose }) => {
  const [agingEnabled, setAgingEnabled] = useState(storage.get('ai_aging_enabled', true));
  const [agingThreshold, setAgingThreshold] = useState(storage.get('ai_aging_days', 30));
  const [showSaved, setShowSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    storage.set('ai_aging_enabled', agingEnabled);
    storage.set('ai_aging_days', agingThreshold);
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-background-card border border-white/10 rounded-[2.5rem] overflow-hidden shadow-stadium animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/20">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">AI ANALİZ PANELİ</h2>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Yapay Zeka & Arşiv Ayarları</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-10">
          <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-primary/30 transition-all">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-background rounded-2xl text-white/40 group-hover:text-primary transition-colors shadow-inner">
                <Clock size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-black text-white tracking-tight">AI VERİ YAŞLANDIRMA</div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-none">30 günden eski veriler özetlensin</div>
              </div>
            </div>
            <button
              onClick={() => setAgingEnabled(!agingEnabled)}
              className={clsx(
                "w-14 h-8 rounded-full relative transition-all duration-500 p-1",
                agingEnabled ? "bg-primary shadow-neon" : "bg-white/10"
              )}
            >
              <div className={clsx(
                "w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform duration-500",
                agingEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className={clsx("space-y-6 transition-all", !agingEnabled && "opacity-30 pointer-events-none grayscale")}>
            <div className="flex justify-between items-center px-2">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">ÖZETLEME EŞİĞİ</span>
               <span className="text-xs font-black text-primary px-3 py-1 bg-primary/10 rounded-lg">{agingThreshold} GÜN</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={agingThreshold}
              onChange={(e) => setAgingThreshold(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest px-1">
              <span>Hızlı (1 GÜN)</span>
              <span>Dengeli (30 GÜN)</span>
              <span>Arşivci (90 GÜN)</span>
            </div>
          </div>

          <div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl flex items-start gap-5">
             <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0"><Shield size={16}/></div>
             <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-tight italic">
               * Yaşlandırma özelliği sayesinde tarayıcı belleğiniz optimize edilir ve eski maçlar/haberler yapay zeka tarafından anlamlı tek bir paragraf haline getirilir.
             </p>
          </div>
        </div>

        <div className="p-8 bg-background-inner border-t border-white/5">
          <button
            onClick={handleSave}
            disabled={showSaved}
            className={clsx(
              "w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95",
              showSaved ? "bg-green-500 text-white" : "bg-primary text-black hover:bg-primary-hover shadow-neon"
            )}
          >
            {showSaved ? (
              <>AYARLAR KAYDEDİLDİ!</>
            ) : (
              <><Save size={18} /> AYARLARI UYGULA</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettings;
