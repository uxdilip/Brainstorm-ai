import { useState } from 'react';
import { useBoard } from '../context/BoardContext';
import {
    DndContext,
    closestCorners,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnComponent } from './Column';
import { CardComponent } from './Card';
import { Sidebar } from './Sidebar';
import { Plus } from 'lucide-react';

export const BoardView = () => {
    const { columns, cards, moveCard, createCard } = useBoard();
    const [showAddCard, setShowAddCard] = useState<string | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [newCardDesc, setNewCardDesc] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Skip if dragging onto itself
        if (activeId === overId) return;

        const activeCard = cards.find(c => c._id === activeId);
        if (!activeCard) return;

        let targetColumnId: string;
        let targetPosition: number;

        // Check if dropped on a column droppable zone
        if (overId.startsWith('droppable-')) {
            targetColumnId = overId.replace('droppable-', '');
            const columnCards = cards.filter(c => c.columnId === targetColumnId);
            targetPosition = columnCards.length;
        } else {
            // Dropped on another card
            const overCard = cards.find(c => c._id === overId);
            if (!overCard) return;
            targetColumnId = overCard.columnId;
            targetPosition = overCard.position;
        }

        // Only move if actually changing position
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

    const activeCard = activeId ? cards.find(c => c._id === activeId) : null;
    const firstColumnId = columns[0]?._id;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)] bg-[#f7f6f3]">
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-3 sm:gap-4 h-full pb-4 lg:pb-0">
                        {columns.map((column) => {
                            const columnCards = cards
                                .filter(c => c.columnId === column._id)
                                .sort((a, b) => a.position - b.position);

                            return (
                                <div key={column._id} className="flex-shrink-0 w-72 sm:w-80 h-full">
                                    <div className="bg-white rounded-lg border border-[#e9e9e7] shadow-sm p-3 sm:p-4 h-full flex flex-col">
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-shrink-0">
                                            <h3 className="text-sm sm:text-base font-semibold text-[#37352f]">{column.title}</h3>
                                            <span className="bg-[#f1f1ef] text-[#787774] text-xs px-2 sm:px-2.5 py-1 rounded-full font-medium">
                                                {columnCards.length}
                                            </span>
                                        </div>

                                        {/* Scrollable Cards Area */}
                                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                                            <DroppableColumn columnId={column._id}>
                                                <SortableContext
                                                    items={columnCards.map(c => c._id)}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-2 pb-3">
                                                        <ColumnComponent
                                                            column={column}
                                                            cards={columnCards}
                                                        />
                                                    </div>
                                                </SortableContext>
                                            </DroppableColumn>
                                        </div>

                                        {/* Only show "Add Card" button in the first column (Ideas) */}
                                        {column._id === firstColumnId && (
                                            <div className="flex-shrink-0 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#e9e9e7]">
                                                {showAddCard === column._id ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={newCardTitle}
                                                            onChange={(e) => setNewCardTitle(e.target.value)}
                                                            placeholder="Card title..."
                                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-[#e9e9e7] rounded-md text-[#37352f] placeholder-[#9b9a97] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all text-xs sm:text-sm"
                                                            autoFocus
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleAddCard(column._id);
                                                                }
                                                            }}
                                                        />
                                                        <textarea
                                                            value={newCardDesc}
                                                            onChange={(e) => setNewCardDesc(e.target.value)}
                                                            placeholder="Description (optional)"
                                                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-[#e9e9e7] rounded-md text-[#37352f] placeholder-[#9b9a97] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] resize-none transition-all text-xs sm:text-sm"
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAddCard(column._id)}
                                                                className="flex-1 bg-[#2383e2] text-white py-1.5 rounded-md hover:bg-[#1a73cf] transition-colors text-xs sm:text-sm font-medium"
                                                            >
                                                                Add
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setShowAddCard(null);
                                                                    setNewCardTitle('');
                                                                    setNewCardDesc('');
                                                                }}
                                                                className="flex-1 bg-[#f1f1ef] text-[#787774] py-1.5 rounded-md hover:bg-[#e9e9e7] transition-colors text-xs sm:text-sm font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowAddCard(column._id)}
                                                        className="w-full bg-[#f7f6f3] text-[#787774] py-1.5 sm:py-2 rounded-md hover:bg-[#f1f1ef] transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium border border-[#e9e9e7]"
                                                    >
                                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        Add card
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Drag Overlay for smooth dragging visual */}
                    <DragOverlay>
                        {activeCard ? (
                            <div className="opacity-95 rotate-2 scale-105">
                                <CardComponent card={activeCard} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <Sidebar />
        </div>
    );
};

// Droppable column component to accept drops on empty columns
const DroppableColumn = ({ columnId, children }: { columnId: string; children: React.ReactNode }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `droppable-${columnId}`
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-full transition-all duration-200 rounded-lg p-1 ${isOver ? 'bg-[#e5f2ff] ring-2 ring-[#2383e2]/30' : ''
                }`}
        >
            {children}
        </div>
    );
};
