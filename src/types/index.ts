export interface User {
  id: string;
  username: string;
  avatar: string;
  favoriteTeam: string;
}

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeLogo?: string;
  awayLogo?: string;
  time: string;
  date: number;
  aiSummary?: string;
  status: 'live' | 'finished' | 'scheduled';
  stats: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
    fouls: [number, number];
  };
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  minute: number | string;
  type: 'goal' | 'card' | 'commentary';
  team?: 'home' | 'away';
  player?: string;
  description: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  timestamp: number;
}

export interface ForumMessage {
  id: string;
  topicId: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface CafeRoom {
  id: string;
  name: string;
  creator: string;
  participants: number;
  isActive: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image?: string;
  date: number;
  category: string;
  isAiSummarized: boolean;
}
