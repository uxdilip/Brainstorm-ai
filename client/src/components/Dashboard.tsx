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
        <div className="min-h-screen bg-[#f7f6f3]">
            {/* Notion-style Header */}
            <header className="bg-white border-b border-[#e9e9e7] sticky top-0 z-50">
                <div className="container mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#2383e2]" />
                            <h1 className="text-base sm:text-xl font-semibold text-[#37352f] hidden sm:block">BrainStorm AI</h1>
                            <h1 className="text-base font-semibold text-[#37352f] sm:hidden">BS AI</h1>
                        </div>

                        {/* Board Tabs */}
                        <div className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-none">
                            {boards.map((b) => (
                                <button
                                    key={b._id}
                                    onClick={() => loadBoard(b._id)}
                                    className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${board?._id === b._id
                                        ? 'bg-[#e5f2ff] text-[#2383e2]'
                                        : 'text-[#787774] hover:bg-[#f1f1ef] hover:text-[#37352f]'
                                        }`}
                                >
                                    {b.name}
                                </button>
                            ))}

                            <button
                                onClick={() => setShowNewBoard(true)}
                                className="p-1.5 text-[#787774] rounded-md hover:bg-[#f1f1ef] transition-colors flex-shrink-0"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <span className="text-xs sm:text-sm text-[#787774] font-medium hidden md:block">{user?.username}</span>
                        <button
                            onClick={logout}
                            className="p-1.5 sm:p-2 text-[#787774] rounded-md hover:bg-[#f1f1ef] transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* New Board Modal - Notion style */}
            {showNewBoard && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-slide-in px-4">
                    <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-[480px] border border-[#e9e9e7]">
                        <h3 className="text-base sm:text-lg font-semibold text-[#37352f] mb-4">Create new board</h3>
                        <input
                            type="text"
                            value={newBoardName}
                            onChange={(e) => setNewBoardName(e.target.value)}
                            placeholder="Board name"
                            className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md text-sm sm:text-base text-[#37352f] placeholder-[#9b9a97] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all mb-4"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowNewBoard(false)}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-[#787774] rounded-md hover:bg-[#f1f1ef] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createBoard}
                                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-[#2383e2] text-white rounded-md hover:bg-[#1a73cf] transition-colors font-medium"
                            >
                                Create board
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {board && <BoardView />}
        </div>
    );
};
