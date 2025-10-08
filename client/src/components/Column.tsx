import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType, Column } from '../types';
import { CardComponent } from './Card';

interface ColumnProps {
    column: Column;
    cards: CardType[];
}

export const ColumnComponent = ({ cards }: ColumnProps) => {
    return (
        <>
            {cards.map((card) => (
                <SortableCard key={card._id} card={card} />
            ))}
        </>
    );
};

const SortableCard = ({ card }: { card: CardType }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: card._id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <CardComponent card={card} />
        </div>
    );
};
