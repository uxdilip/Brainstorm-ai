import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import { DndContext, closestCorners, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnComponent } from './Column';
import { Sidebar } from './Sidebar';
import { Plus } from 'lucide-react';

export const BoardView = () => {
    const { columns, cards, moveCard, createCard } = useBoard();
    const [showAddCard, setShowAddCard] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDesc, setNewCardDesc] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeCard = cards.find(c => c._id === activeId);
        if (!activeCard) return;

        let targetColumnId: string;
        let targetPosition: number;

        if (overId.startsWith('column-')) {
            targetColumnId = overId.replace('column-', '');
            const columnCards = cards.filter(c => c.columnId === targetColumnId);
            targetPosition = columnCards.length;
        } else {
            const overCard = cards.find(c => c._id === overId);
            if (!overCard) return;
            targetColumnId = overCard.columnId;
            targetPosition = overCard.position;
        }

        if (activeCard.columnId !== targetColumnId || activeCard.position !== targetPosition) {
            await moveCard(activeId, targetColumnId, targetPosition);
        }
    };

    const handleAddCard = async (columnId: string) => {
        if (!newCardTitle.trim()) return;

        try {
            await createCard(columnId, newCardTitle, newCardDesc);
            setNewCardTitle('');
            setNewCardDesc('');
            setShowAddCard(null);
        } catch (error) {
            console.error('Error adding card:', error);
        }
    };

    return (
        <div className="flex h-[calc(100vh-73px)]">
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 h-full">
                        {columns.map((column) => (
                            <div key={column._id} className="flex-shrink-0 w-80">
                                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">{column.title}</h3>
                                        <span className="bg-white/20 text-white text-sm px-2 py-1 rounded">
                                            {cards.filter(c => c.columnId === column._id).length}
                                        </span>
                                    </div>

                                    <SortableContext
                                        items={[`column-${column._id}`, ...cards.filter(c => c.columnId === column._id).map(c => c._id)]}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
                                            <div id={`column-${column._id}`} className="min-h-[20px]" />
                                            <ColumnComponent
                                                column={column}
                                                cards={cards.filter(c => c.columnId === column._id).sort((a, b) => a.position - b.position)}
                                            />
                                        </div>
                                    </SortableContext>

                                    {showAddCard === column._id ? (
                                        <div className="mt-4 bg-white rounded-lg p-3 space-y-2">
                                            <input
                                                type="text"
                                                value={newCardTitle}
                                                onChange={(e) => setNewCardTitle(e.target.value)}
                                                placeholder="Card title"
                                                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500"
                                                autoFocus
                                            />
                                            <textarea
                                                value={newCardDesc}
                                                onChange={(e) => setNewCardDesc(e.target.value)}
                                                placeholder="Description (optional)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddCard(column._id)}
                                                    className="flex-1 bg-primary-600 text-white py-1 rounded hover:bg-primary-700 transition-colors text-sm"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => setShowAddCard(null)}
                                                    className="flex-1 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddCard(column._id)}
                                            className="mt-4 w-full bg-white/20 text-white py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Card
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DndContext>
            </div>

            <Sidebar />
        </div>
    );
};
