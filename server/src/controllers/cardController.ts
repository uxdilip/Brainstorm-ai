import { Response } from 'express';
import Card from '../models/Card';
import Board from '../models/Board';
import { AuthRequest } from '../middleware/auth';
import { generateEmbedding, analyzeMood } from '../services/aiService';

export const createCard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { columnId, boardId, title, description } = req.body;

        const board = await Board.findOne({
            _id: boardId,
            $or: [
                { userId: req.userId },
                { sharedWith: req.userId }
            ]
        });

        if (!board) {
            res.status(404).json({ message: 'Board not found' });
            return;
        }

        const cardCount = await Card.countDocuments({ columnId });

        const embedding = await generateEmbedding(`${title} ${description}`);
        const mood = await analyzeMood(`${title} ${description}`);

        const card = new Card({
            columnId,
            boardId,
            title,
            description: description || '',
            position: cardCount,
            embedding,
            mood
        });

        await card.save();

        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;

        const card = await Card.findById(req.params.id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        const board = await Board.findOne({
            _id: card.boardId,
            $or: [
                { userId: req.userId },
                { sharedWith: req.userId }
            ]
        });

        if (!board) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        if (title) card.title = title;
        if (description !== undefined) card.description = description;

        if (title || description) {
            card.embedding = await generateEmbedding(`${card.title} ${card.description}`);
            card.mood = await analyzeMood(`${card.title} ${card.description}`);
        }

        await card.save();

        res.json(card);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const moveCard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { columnId, position } = req.body;

        const card = await Card.findById(req.params.id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        const board = await Board.findOne({
            _id: card.boardId,
            $or: [
                { userId: req.userId },
                { sharedWith: req.userId }
            ]
        });

        if (!board) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const oldColumnId = card.columnId;
        const oldPosition = card.position;

        if (oldColumnId.toString() === columnId) {
            if (position < oldPosition) {
                await Card.updateMany(
                    {
                        columnId,
                        position: { $gte: position, $lt: oldPosition }
                    },
                    { $inc: { position: 1 } }
                );
            } else {
                await Card.updateMany(
                    {
                        columnId,
                        position: { $gt: oldPosition, $lte: position }
                    },
                    { $inc: { position: -1 } }
                );
            }
        } else {
            await Card.updateMany(
                {
                    columnId: oldColumnId,
                    position: { $gt: oldPosition }
                },
                { $inc: { position: -1 } }
            );

            await Card.updateMany(
                {
                    columnId,
                    position: { $gte: position }
                },
                { $inc: { position: 1 } }
            );
        }

        card.columnId = columnId;
        card.position = position;
        await card.save();

        res.json(card);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            res.status(404).json({ message: 'Card not found' });
            return;
        }

        const board = await Board.findOne({
            _id: card.boardId,
            $or: [
                { userId: req.userId },
                { sharedWith: req.userId }
            ]
        });

        if (!board) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await Card.updateMany(
            {
                columnId: card.columnId,
                position: { $gt: card.position }
            },
            { $inc: { position: -1 } }
        );

        await Card.findByIdAndDelete(card._id);

        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
