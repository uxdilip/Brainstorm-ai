import { useState } from 'react';
import { Card as CardType } from '../types';
import { useBoard } from '../context/BoardContext';
import { Edit2, Trash2, Smile, Meh, Frown } from 'lucide-react';

interface CardProps {
    card: CardType;
}

export const CardComponent = ({ card }: CardProps) => {
    const { updateCard, deleteCard } = useBoard();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);

    const handleSave = async () => {
        try {
            await updateCard(card._id, title, description);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating card:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this card?')) {
            try {
                await deleteCard(card._id);
            } catch (error) {
                console.error('Error deleting card:', error);
            }
        }
    };

    const getMoodIcon = () => {
        switch (card.mood) {
            case 'positive':
                return <Smile className="w-4 h-4 text-green-500" />;
            case 'negative':
                return <Frown className="w-4 h-4 text-red-500" />;
            default:
                return <Meh className="w-4 h-4 text-gray-400" />;
        }
    };

    const getClusterColor = (clusterId?: string) => {
        if (!clusterId) return { bg: '', border: '', label: '' };
        
        const colors = [
            { bg: 'bg-blue-50', border: 'border-blue-400', label: 'bg-blue-500' },
            { bg: 'bg-green-50', border: 'border-green-400', label: 'bg-green-500' },
            { bg: 'bg-purple-50', border: 'border-purple-400', label: 'bg-purple-500' },
            { bg: 'bg-orange-50', border: 'border-orange-400', label: 'bg-orange-500' },
            { bg: 'bg-pink-50', border: 'border-pink-400', label: 'bg-pink-500' },
            { bg: 'bg-yellow-50', border: 'border-yellow-400', label: 'bg-yellow-500' },
            { bg: 'bg-indigo-50', border: 'border-indigo-400', label: 'bg-indigo-500' },
            { bg: 'bg-red-50', border: 'border-red-400', label: 'bg-red-500' }
        ];
        
        const index = parseInt(clusterId.replace('cluster-', '')) % colors.length;
        return colors[index];
    };

    const getClusterLabel = (clusterId?: string) => {
        if (!clusterId) return null;
        
        const clusterNum = parseInt(clusterId.replace('cluster-', ''));
        const labels = ['💎', '🌟', '🎯', '🔥', '💡', '🚀', '⚡', '🌈'];
        return labels[clusterNum % labels.length];
    };

    if (isEditing) {
        return (
            <div className="bg-white rounded-lg p-3 shadow-sm space-y-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    rows={2}
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-primary-600 text-white py-1 rounded hover:bg-primary-700 text-xs"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300 text-xs"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const clusterColors = getClusterColor(card.clusterId);
    const clusterLabel = getClusterLabel(card.clusterId);

    return (
        <div className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move border-2 ${card.clusterId ? clusterColors.bg + ' ' + clusterColors.border : 'bg-white border-gray-200'
            }`}>
            {card.clusterId && (
                <div className="flex items-center gap-1 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${clusterColors.label}`}>
                        {clusterLabel} Cluster {card.clusterId.replace('cluster-', '')}
                    </span>
                </div>
            )}
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-800 flex-1">{card.title}</h4>
                <div className="flex items-center gap-1">
                    {getMoodIcon()}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>
            {card.description && (
                <p className="text-sm text-gray-600 line-clamp-3">{card.description}</p>
            )}
            {card.clusterId && (
                <div className="mt-2 text-xs text-gray-500">
                    🏷️ {card.clusterId}
                </div>
            )}
        </div>
    );
};
