import { Match, MatchEvent } from '@/types';

export const dataService = {
  getLiveScores: async (): Promise<Match[]> => {
    try {
      // Fetch Turkish Super Lig (Soccer)
      const soccerRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard');
      const soccerData = await soccerRes.json();

      // Fetch Euroleague (Basketball)
      const basketballRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard');
      const basketballData = await basketballRes.json();

      const matches: Match[] = [];

      // Process Soccer
      soccerData.events?.forEach((event: any) => {
        const competition = event.competitions[0];
        matches.push({
          id: event.id,
          league: 'SÜPER LİG',
          homeTeam: competition.competitors[0].team.displayName,
          awayTeam: competition.competitors[1].team.displayName,
          homeScore: parseInt(competition.competitors[0].score) || 0,
          awayScore: parseInt(competition.competitors[1].score) || 0,
          time: event.status.type.detail,
          status: event.status.type.state === 'in' ? 'live' : event.status.type.state === 'post' ? 'finished' : 'scheduled',
          stats: {
            possession: [50, 50], // ESPN free API has limited stats, we might need detail endpoint for full
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            corners: [0, 0],
            fouls: [0, 0]
          },
          events: []
        });
      });

      // Process Basketball
      basketballData.events?.forEach((event: any) => {
        const competition = event.competitions[0];
        matches.push({
          id: event.id,
          league: 'EURO LEAGUE',
          homeTeam: competition.competitors[0].team.displayName,
          awayTeam: competition.competitors[1].team.displayName,
          homeScore: parseInt(competition.competitors[0].score) || 0,
          awayScore: parseInt(competition.competitors[1].score) || 0,
          time: event.status.type.detail,
          status: event.status.type.state === 'in' ? 'live' : event.status.type.state === 'post' ? 'finished' : 'scheduled',
          stats: {
            possession: [50, 50],
            shots: [0, 0],
            shotsOnTarget: [0, 0],
            corners: [0, 0],
            fouls: [0, 0]
          },
          events: []
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
       return data.articles.map((art: any, index: number) => ({
         id: `news-${index}`,
         title: art.headline,
         summary: art.description,
         content: art.story || art.description,
         date: new Date(art.published).getTime(),
         category: 'Süper Lig',
         isAiSummarized: false
       }));
     } catch (error) {
       console.error('Error fetching news:', error);
       return [];
     }
  }
};
