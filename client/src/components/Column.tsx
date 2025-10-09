import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Column } from '../types';
import { CardComponent } from './Card';

interface ColumnProps {
    column: Column;
    cards: CardType[];
}

export const ColumnComponent = ({ cards }: ColumnProps) => {
    if (cards.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-[#9b9a97] text-sm">
                Drop cards here or drag from Ideas
            </div>
        );
    }

    return (
        <>
            {cards.map((card) => (
                <SortableCard key={card._id} card={card} />
            ))}
        </>
    );
};

const SortableCard = ({ card }: { card: CardType }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: card._id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none"
        >
            <CardComponent card={card} />
        </div>
    );
};
