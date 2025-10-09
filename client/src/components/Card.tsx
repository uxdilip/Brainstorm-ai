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
            { bg: 'bg-blue-50/60', border: 'border-blue-300/40', label: 'bg-blue-500/90' },
            { bg: 'bg-green-50/60', border: 'border-green-300/40', label: 'bg-green-500/90' },
            { bg: 'bg-purple-50/60', border: 'border-purple-300/40', label: 'bg-purple-500/90' },
            { bg: 'bg-orange-50/60', border: 'border-orange-300/40', label: 'bg-orange-500/90' },
            { bg: 'bg-pink-50/60', border: 'border-pink-300/40', label: 'bg-pink-500/90' },
            { bg: 'bg-yellow-50/60', border: 'border-yellow-300/40', label: 'bg-yellow-500/90' },
            { bg: 'bg-indigo-50/60', border: 'border-indigo-300/40', label: 'bg-indigo-500/90' },
            { bg: 'bg-red-50/60', border: 'border-red-300/40', label: 'bg-red-500/90' }
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
            <div className="bg-white rounded-lg p-3 shadow-md border border-[#e9e9e7] space-y-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-2 py-1 border border-[#e9e9e7] rounded-md text-sm text-[#37352f] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all"
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-[#e9e9e7] rounded-md text-sm text-[#37352f] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] resize-none transition-all"
                    rows={2}
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-[#2383e2] text-white py-1 rounded-md hover:bg-[#1a73cf] text-xs font-medium transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-[#f1f1ef] text-[#787774] py-1 rounded-md hover:bg-[#e9e9e7] text-xs font-medium transition-colors"
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
        <div className={`rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing border ${card.clusterId ? clusterColors.bg + ' ' + clusterColors.border : 'bg-white border-[#e9e9e7]'
            }`}>
            {card.clusterId && (
                <div className="flex items-center gap-1 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${clusterColors.label}`}>
                        {clusterLabel} Cluster {card.clusterId.replace('cluster-', '')}
                    </span>
                </div>
            )}
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-[#37352f] flex-1 text-sm">{card.title}</h4>
                <div className="flex items-center gap-1">
                    {getMoodIcon()}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-[#9b9a97] hover:text-[#2383e2] transition-colors"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1 text-[#9b9a97] hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            {card.description && (
                <p className="text-sm text-[#787774] line-clamp-3 leading-relaxed">{card.description}</p>
            )}
        </div>
    );
};
