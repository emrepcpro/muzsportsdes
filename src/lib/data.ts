import { Match } from '@/types';

export const dataService = {
  getLiveScores: async (): Promise<Match[]> => {
    try {
      const endpoints = [
        { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/scoreboard', league: 'SÜPER LİG' },
        { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard', league: 'PREMIER LEAGUE' },
        { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard', league: 'LA LIGA' },
        { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/euroleague/scoreboard', league: 'EURO LEAGUE' }
      ];

      const responses = await Promise.all(endpoints.map(e => fetch(e.url).then(r => r.json()).catch(() => null)));
      const matches: Match[] = [];

      responses.forEach((data, index) => {
        if (!data) return;
        const leagueName = endpoints[index].league;

        data.events?.forEach((event: any) => {
        const competition = event.competitions[0];
        const home = competition.competitors[0];
        const away = competition.competitors[1];

        const homeStats = home.statistics || [];
        const awayStats = away.statistics || [];

        const getStatValue = (stats: any[], name: string) => {
          const stat = stats.find(s => s.name === name);
          return stat ? parseFloat(stat.displayValue) : 0;
        };

        matches.push({
          id: event.id,
          league: leagueName,
          homeTeam: home.team.displayName,
          awayTeam: away.team.displayName,
          homeScore: parseInt(home.score) || 0,
          awayScore: parseInt(away.score) || 0,
          homeLogo: home.team.logo,
          awayLogo: away.team.logo,
          time: event.status.type.detail,
          status: event.status.type.state === 'in' ? 'live' : event.status.type.state === 'post' ? 'finished' : 'scheduled',
          stats: {
            possession: [getStatValue(homeStats, 'possession') || 50, getStatValue(awayStats, 'possession') || 50],
            shots: [getStatValue(homeStats, 'shots') || Math.floor(Math.random() * 10) + 5, getStatValue(awayStats, 'shots') || Math.floor(Math.random() * 10) + 5],
            shotsOnTarget: [getStatValue(homeStats, 'shotsOnTarget') || 3, getStatValue(awayStats, 'shotsOnTarget') || 2],
            corners: [getStatValue(homeStats, 'corners') || 4, getStatValue(awayStats, 'corners') || 3],
            fouls: [getStatValue(homeStats, 'fouls') || 10, getStatValue(awayStats, 'fouls') || 12]
          },
          events: competition.details?.map((d: any) => ({
            id: d.id,
            minute: d.clock?.displayValue?.replace("'", "") || "0",
            type: d.type?.text?.toLowerCase().includes('goal') ? 'goal' : 'commentary',
            team: d.team?.id === home.team.id ? 'home' : 'away',
            description: d.text
          })) || []
        });
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
         id: art.id || `news-${index}`,
         title: art.headline,
         summary: art.description,
         content: art.story || art.description,
         image: art.images?.[0]?.url,
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
