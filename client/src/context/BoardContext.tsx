import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';
import { Board, Column, Card, Cluster, BoardContextType } from '../types';

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const loadBoard = async (boardId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/boards/${boardId}`);
      setBoard(response.data.board);
      setColumns(response.data.columns);
      setCards(response.data.cards);
    } catch (error) {
      console.error('Error loading board:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (columnId: string, title: string, description: string) => {
    try {
      const response = await api.post('/cards', {
        columnId,
        boardId: board?._id,
        title,
        description
      });
      setCards([...cards, response.data]);

      await getSuggestions(title, description);
    } catch (error) {
      console.error('Error creating card:', error);
      throw error;
    }
  };

  const updateCard = async (cardId: string, title: string, description: string) => {
    try {
      const response = await api.put(`/cards/${cardId}`, { title, description });
      setCards(cards.map(c => c._id === cardId ? response.data : c));
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };

  const moveCard = async (cardId: string, columnId: string, position: number) => {
    try {
      const response = await api.put(`/cards/${cardId}/move`, { columnId, position });
      setCards(cards.map(c => c._id === cardId ? response.data : c));
    } catch (error) {
      console.error('Error moving card:', error);
      throw error;
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await api.delete(`/cards/${cardId}`);
      setCards(cards.filter(c => c._id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };

  const getSuggestions = async (cardTitle: string, cardDescription: string) => {
    try {
      const response = await api.post('/ai/suggest', {
        cardTitle,
        cardDescription,
        boardId: board?._id
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    }
  };

  const summarizeBoard = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ai/summarize', { boardId: board?._id });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error summarizing board:', error);
      setSummary('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const clusterCards = async (threshold: number = 0.7) => {
    setLoading(true);
    try {
      const response = await api.post('/ai/cluster', { boardId: board?._id, threshold });
      setClusters(response.data.clusters);
      
      const updatedCards = cards.map(card => {
        const cluster = response.data.clusters.find((c: Cluster) => 
          c.cardIds.includes(card._id)
        );
        return cluster ? { ...card, clusterId: cluster.clusterId } : card;
      });
      setCards(updatedCards);
    } catch (error) {
      console.error('Error clustering cards:', error);
      setClusters([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCards = async (query: string): Promise<Card[]> => {
    try {
      const response = await api.post('/ai/search', { boardId: board?._id, query });
      return response.data.cards;
    } catch (error) {
      console.error('Error searching cards:', error);
      return [];
    }
  };

  return (
    <BoardContext.Provider
      value={{
        board,
        columns,
        cards,
        clusters,
        suggestions,
        summary,
        loadBoard,
        createCard,
        updateCard,
        moveCard,
        deleteCard,
        getSuggestions,
        summarizeBoard,
        clusterCards,
        searchCards,
        loading
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within BoardProvider');
  }
  return context;
};
