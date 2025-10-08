export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Board {
  _id: string;
  userId: string;
  name: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: string;
}

export interface Card {
  _id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string;
  position: number;
  embedding?: number[];
  mood?: 'positive' | 'neutral' | 'negative';
  clusterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cluster {
  clusterId: string;
  cardIds: string[];
  cards: Card[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface BoardContextType {
  board: Board | null;
  columns: Column[];
  cards: Card[];
  clusters: Cluster[];
  suggestions: string[];
  summary: string;
  loadBoard: (boardId: string) => Promise<void>;
  createCard: (columnId: string, title: string, description: string) => Promise<void>;
  updateCard: (cardId: string, title: string, description: string) => Promise<void>;
  moveCard: (cardId: string, columnId: string, position: number) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getSuggestions: (cardTitle: string, cardDescription: string) => Promise<void>;
  summarizeBoard: () => Promise<void>;
  clusterCards: (threshold?: number) => Promise<void>;
  searchCards: (query: string) => Promise<Card[]>;
  loading: boolean;
}
