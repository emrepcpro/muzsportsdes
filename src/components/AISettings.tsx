import React, { useEffect, useState } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { storage } from '@/lib/storage';
import { ai } from '@/lib/ai';
import { p2p } from '@/lib/p2p';

interface AISettingsProps {
  enabled: boolean;
  agingDays: number;
  onEnabledChange: (value: boolean) => void;
  onAgingDaysChange: (value: number) => void;
}

const AISettings: React.FC<AISettingsProps> = ({
  enabled,
  agingDays,
  onEnabledChange,
  onAgingDaysChange,
}) => {
  const [provider, setProvider] = useState(storage.get('ai_provider', 'local'));
  const [apiKey, setApiKey] = useState(storage.get('ai_api_key', ''));
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    storage.set('ai_provider', provider);
    storage.set('ai_api_key', apiKey);
    p2p.broadcast('AI_PROVIDER', { provider });
  }, [provider, apiKey]);

  const testProvider = async () => {
    setTestStatus('Test ediliyor...');
    const res = await ai.testProvider();
    setTestStatus(res.ok ? `OK: ${res.message}` : `Hata: ${res.message}`);
    setTimeout(() => setTestStatus(null), 4000);
  };

  return (
    <div className="rounded-2xl border border-primary/15 bg-black/30 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles size={16} />
        <span>AI Ayarları</span>
      </div>
      <div className="mt-4 space-y-4 text-sm text-white/70">
        <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={14} />
            Otomatik özetleme
          </span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-background text-primary focus:ring-primary"
          />
        </label>

        <label className="block">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            <span>Yaş sınırı</span>
            <span>{agingDays} gün</span>
          </div>
          <input
            type="range"
            min="7"
            max="90"
            step="7"
            value={agingDays}
            onChange={(e) => onAgingDaysChange(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </label>

        <div className="pt-2">
          <label className="text-[11px] font-semibold uppercase text-white/40">AI Sağlayıcısı</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full mt-2 p-2 rounded-xl bg-background-inner border border-white/5">
            <option value="local">Yerel (tarayıcı içi, ücretsiz)</option>
            <option value="openai">OpenAI (API anahtarı gerektirir)</option>
          </select>
        </div>

        {provider === 'openai' && (
          <div>
            <label className="text-[11px] font-semibold uppercase text-white/40">OpenAI API Key</label>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." className="mt-2 w-full p-3 rounded-xl bg-background-inner border border-white/5" />
            <div className="flex gap-2 mt-3">
              <button onClick={testProvider} className="px-3 py-2 bg-primary text-black rounded-lg font-bold">Sağlayıcıyı Test Et</button>
              {testStatus && <div className="text-sm text-white/60 px-2 py-2">{testStatus}</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AISettings;
