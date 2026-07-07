import { Match } from '@/types';

export const dataService = {
  getLiveScores: async (): Promise<Match[]> => {
    try {
      const soccerRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard');
      const soccerData = await soccerRes.json();
      const basketballRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard');
      const basketballData = await basketballRes.json();

      const matches: Match[] = [];

      soccerData.events?.slice(0, 3).forEach((event: any) => {
        const competition = event.competitions?.[0];
        if (!competition?.competitors?.length) return;
        const home = competition.competitors[0];
        const away = competition.competitors[1];
        matches.push({
          id: event.id,
          league: 'SÜPER LİG',
          homeTeam: home.team.displayName,
          awayTeam: away.team.displayName,
          homeScore: Number(home.score) || 0,
          awayScore: Number(away.score) || 0,
          time: event.status?.type?.detail || 'Takvim',
          status: event.status?.type?.state === 'in' ? 'live' : event.status?.type?.state === 'post' ? 'finished' : 'scheduled',
          stats: { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], corners: [0, 0], fouls: [0, 0] },
          events: [],
        });
      });

      basketballData.events?.slice(0, 2).forEach((event: any) => {
        const competition = event.competitions?.[0];
        if (!competition?.competitors?.length) return;
        const home = competition.competitors[0];
        const away = competition.competitors[1];
        matches.push({
          id: event.id,
          league: 'EURO LEAGUE',
          homeTeam: home.team.displayName,
          awayTeam: away.team.displayName,
          homeScore: Number(home.score) || 0,
          awayScore: Number(away.score) || 0,
          time: event.status?.type?.detail || 'Takvim',
          status: event.status?.type?.state === 'in' ? 'live' : event.status?.type?.state === 'post' ? 'finished' : 'scheduled',
          stats: { possession: [50, 50], shots: [0, 0], shotsOnTarget: [0, 0], corners: [0, 0], fouls: [0, 0] },
          events: [],
        });
      });

      return matches;
    } catch (error) {
      console.error('Error fetching live scores:', error);
      return [];
    }
  },

  getNews: async () => {
    try {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/news');
      const data = await res.json();
      return (data.articles || []).slice(0, 6).map((art: any, index: number) => ({
        id: `news-${index}`,
        title: art.headline,
        summary: art.description || art.story || '',
        content: art.story || art.description || '',
        date: new Date(art.published || Date.now()).getTime(),
        category: art.sport?.name || 'Spor',
        isAiSummarized: false,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },
};
