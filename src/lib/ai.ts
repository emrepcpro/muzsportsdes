import { storage } from './storage';

export const ai = {
  summarize: async (content: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `[AI ÖZETİ]: ${content.substring(0, 200)}... Bu içerik yaşlandırma eşiğini geçtiği için yapay zeka tarafından optimize edilerek özetlenmiştir.`;
  },

  summarizeMatch: async (match: any): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `[MAÇ ÖZETİ]: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}. Bu karşılaşma ${match.league} kapsamında oynanmıştır. AI Analizi: Maçın kritik anları ve istatistikleri sistem tarafından arşivlenmiştir.`;
  },

  predictMatch: (homeTeam: string, awayTeam: string): string => {
    const outcomes = [
      `${homeTeam} ev sahibi avantajıyla favori görünüyor. Tahmin: 2-1`,
      `${awayTeam} son deplasman formunu korursa sürpriz yapabilir. Tahmin: 1-1`,
      `İki takımın savunma ağırlıklı oyunu düşük skorlu bir maça işaret ediyor. Tahmin: 0-0`,
      `Hücum hattı güçlü olan ${homeTeam} maçı domine edecektir. Tahmin: 3-0`
    ];
    return outcomes[Math.floor(Math.random() * outcomes.length)];
  },

  shouldSummarize: (timestamp: number): boolean => {
    const isEnabled = storage.get('ai_aging_enabled', true);
    if (!isEnabled) return false;

    const thresholdDays = storage.get('ai_aging_days', 30);
    const thresholdInMs = thresholdDays * 24 * 60 * 60 * 1000;
    return (Date.now() - timestamp) > thresholdInMs;
  }
};
