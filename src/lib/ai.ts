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

  analyzeMatchWithAi: async (homeTeam: string, awayTeam: string, homeScore: number, awayScore: number, league: string, stats: any): Promise<string> => {
    const provider = storage.get('ai_provider', 'local') as Provider;
    const apiKey = storage.get('ai_api_key', '');

    if (provider === 'openai' && apiKey) {
      try {
        const prompt = `Lütfen aşağıdaki maçı ve canlı istatistikleri derinlemesine analiz et ve Türkçe olarak teknik direktör bakış açısıyla yorumla, taktiksel tavsiyeler ver:\n\nLig: ${league}\nEv Sahibi: ${homeTeam} (${homeScore})\nDeplasman: ${awayTeam} (${awayScore})\nİstatistikler: ${JSON.stringify(stats)}`;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return data?.choices?.[0]?.message?.content || 'Yapay zeka analiz üretemedi.';
        }
      } catch (err) {
        console.error('OpenAI match analysis failed:', err);
      }
    }

    // High fidelity simulation incorporating actual live stats
    await new Promise((r) => setTimeout(r, 600));
    const isDraw = homeScore === awayScore;
    const homeLeading = homeScore > awayScore;
    const leadTeam = homeLeading ? homeTeam : awayTeam;
    const trailingTeam = homeLeading ? awayTeam : homeTeam;

    const statsDetail = `Topla oynama oranı %${stats.possession?.[0] || 50} - %${stats.possession?.[1] || 50}. Şut sayıları ${stats.shots?.[0] || 0} ev sahibi, ${stats.shots?.[1] || 0} deplasman.`;

    if (isDraw) {
      return `[MuzSports AI - Taktiksel Analiz]\n\nHer iki takım da sahada dengeli bir mücadele veriyor. Skor ${homeScore}-${awayScore} eşitlikte. ${statsDetail} İki teknik direktör de orta sahayı kalabalık tutarak geçiş savunmasına önem veriyor. Maçın gidişatını duran toplar veya kanat bindirmeleri belirleyecektir.`;
    } else {
      return `[MuzSports AI - Taktiksel Analiz]\n\nAnlık olarak ${leadTeam} maçı ${homeLeading ? `${homeScore}-${awayScore}` : `${awayScore}-${homeScore}`} üstünlükle götürüyor. ${statsDetail} ${trailingTeam} takımı geri dönüş için kanat organizasyonlarını artırmalı ve rakip yarı sahada daha fazla baskı kurmalı. ${leadTeam} ise savunma derinliğini artırarak kontratak fırsatlarını kollamalı.`;
    }
  },

  isOlderThan30Days: (timestamp: number): boolean => {
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > thirtyDaysInMs;
  },

  isOlderThanDays: (timestamp: number, days: number): boolean => {
    const daysInMs = days * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > daysInMs;
  },

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
