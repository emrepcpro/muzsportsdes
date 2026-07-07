import { storage } from './storage';

type Provider = 'local' | 'openai';

async function localSummarize(content: string) {
  await new Promise((r) => setTimeout(r, 400));
  return `[AI ÖZETİ]: ${content.substring(0, 150)}... (yerel özet)`;
}

async function openAiSummarize(content: string, apiKey: string) {
  try {
    const prompt = `Lütfen aşağıdaki içeriği 3-4 cümlede Türkçe olarak özetle:\n\n${content}`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
    return text ? `[AI ÖZETİ]: ${text.trim()}` : await localSummarize(content);
  } catch (err) {
    console.error('OpenAI summarization failed:', err);
    return await localSummarize(content);
  }
}

export const ai = {
  summarize: async (content: string): Promise<string> => {
    const provider = storage.get('ai_provider', 'local') as Provider;
    const apiKey = storage.get('ai_api_key', '');
    if (provider === 'openai' && apiKey) {
      return await openAiSummarize(content, apiKey);
    }
    return await localSummarize(content);
  },

  predictMatch: (homeTeam: string, awayTeam: string): string => {
    const outcomes = [
      `${homeTeam} ev sahibi avantajıyla favori görünüyor. Tahmin: 2-1`,
      `${awayTeam} son deplasman formunu korursa sürpriz yapabilir. Tahmin: 1-1`,
      `İki takımın savunma ağırlıklı oyunu düşük skorlu bir maça işaret ediyor. Tahmin: 0-0`,
      `Hücum hattı güçlü olan ${homeTeam} maçı domine edecektir. Tahmin: 3-0`,
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  },

  isOlderThan30Days: (timestamp: number): boolean => {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > thirtyDaysInMs;
  },

  isOlderThanDays: (timestamp: number, days: number): boolean => {
    const daysInMs = days * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > daysInMs;
  },

  // test provider connectivity (lightweight)
  testProvider: async (): Promise<{ ok: boolean; message?: string }> => {
    const provider = storage.get('ai_provider', 'local') as Provider;
    const apiKey = storage.get('ai_api_key', '');
    if (provider === 'local') return { ok: true, message: 'Yerel özetleyici kullanılıyor' };
    if (!apiKey) return { ok: false, message: 'API anahtarı eksik' };
    try {
      const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!res.ok) return { ok: false, message: `OpenAI bağlantı hatası: ${res.status}` };
      return { ok: true, message: 'OpenAI erişilebiliyor' };
    } catch (err: any) {
      return { ok: false, message: err?.message || 'Bilinmeyen hata' };
    }
  }
};
