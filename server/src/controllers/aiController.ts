import { Response } from 'express';
import Card from '../models/Card';
import Board from '../models/Board';
import { AuthRequest } from '../middleware/auth';
import { generateIdeasuggestions, generateBoardSummary, generateEmbedding, clusterCards, cosineSimilarity } from '../services/aiService';

export const getSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { cardTitle, cardDescription, boardId } = req.body;

        console.log('🤖 AI Suggestions Request:', { cardTitle, cardDescription, boardId });

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

        const existingCards = await Card.find({ boardId }).limit(20);
        const boardContext = existingCards.map(card => `${card.title}: ${card.description}`);

        console.log('📋 Board context:', boardContext.length, 'existing cards');

        const suggestions = await generateIdeasuggestions(cardTitle, cardDescription, boardContext);

        console.log('✨ Generated suggestions:', suggestions);

        res.json({ suggestions });
    } catch (error) {
        console.error('❌ Error in getSuggestions:', error);
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};

export const summarizeBoard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { boardId } = req.body;

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

        const cards = await Card.find({ boardId });

        if (cards.length === 0) {
            res.json({ summary: 'No cards to summarize yet. Start adding ideas!' });
            return;
        }

        const cardsData = cards.map(card => ({
            title: card.title,
            description: card.description
        }));

        const summary = await generateBoardSummary(cardsData);

        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const clusterBoardCards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { boardId, threshold } = req.body;

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

        const cards = await Card.find({ boardId });

        if (cards.length === 0) {
            res.json({ clusters: [] });
            return;
        }

        const cardsWithEmbeddings = await Promise.all(
            cards.map(async (card) => {
                if (!card.embedding || card.embedding.length === 0) {
                    const embedding = await generateEmbedding(`${card.title} ${card.description}`);
                    card.embedding = embedding;
                    await card.save();
                }
                return {
                    id: card._id.toString(),
                    embedding: card.embedding
                };
            })
        );

        const clusters = clusterCards(cardsWithEmbeddings, threshold || 0.7);

        const clusterArray = Array.from(clusters.entries()).map(([clusterId, cardIds]) => ({
            clusterId,
            cardIds,
            cards: cards.filter(card => cardIds.includes(card._id.toString()))
        }));

        for (const cluster of clusterArray) {
            await Card.updateMany(
                { _id: { $in: cluster.cardIds } },
                { clusterId: cluster.clusterId }
            );
        }

        res.json({ clusters: clusterArray });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const searchCards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { boardId, query } = req.body;

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

        const queryEmbedding = await generateEmbedding(query);
        const cards = await Card.find({ boardId });

        const cardsWithSimilarity = await Promise.all(
            cards.map(async (card) => {
                if (!card.embedding || card.embedding.length === 0) {
                    const embedding = await generateEmbedding(`${card.title} ${card.description}`);
                    card.embedding = embedding;
                    await card.save();
                }

                const similarity = cosineSimilarity(queryEmbedding, card.embedding);

                return {
                    card,
                    similarity
                };
            })
        );

        const sortedCards = cardsWithSimilarity
            .filter(item => item.similarity > 0.5)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .map(item => item.card);

        res.json({ cards: sortedCards });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
