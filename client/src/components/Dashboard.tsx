import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../context/BoardContext';
import api from '../services/api';
import { Board as BoardType } from '../types';
import { Plus, LogOut, Sparkles } from 'lucide-react';
import { BoardView } from './BoardView';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { loadBoard, board } = useBoard();
  const [boards, setBoards] = useState<BoardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
      if (response.data.length > 0 && !board) {
        await loadBoard(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    try {
      const response = await api.post('/boards', { name: newBoardName || 'New Board' });
      setBoards([...boards, response.data]);
      setNewBoardName('');
      setShowNewBoard(false);
      await loadBoard(response.data._id);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">BrainStorm AI</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {boards.map((b) => (
                <button
                  key={b._id}
                  onClick={() => loadBoard(b._id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    board?._id === b._id
                      ? 'bg-white text-primary-600 font-semibold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {b.name}
                </button>
              ))}
              
              <button
                onClick={() => setShowNewBoard(true)}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{user?.username}</span>
            <button
              onClick={logout}
              className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {showNewBoard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create New Board</h3>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="Board name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createBoard}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewBoard(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {board && <BoardView />}
    </div>
  );
};
