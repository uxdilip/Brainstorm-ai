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

        console.log('🎯 Clustering request:', { boardId, threshold: threshold || 0.7 });

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
            res.json({ 
                clusters: [], 
                message: 'No cards to cluster',
                stats: { totalCards: 0, clustersCreated: 0 }
            });
            return;
        }

        console.log(`📋 Found ${cards.length} cards to cluster`);

        // Generate embeddings for cards that don't have them
        const cardsWithEmbeddings = await Promise.all(
            cards.map(async (card) => {
                if (!card.embedding || card.embedding.length === 0) {
                    console.log(`🔄 Generating embedding for card: ${card.title}`);
                    const embedding = await generateEmbedding(`${card.title} ${card.description}`);
                    card.embedding = embedding;
                    await card.save();
                }
                return {
                    id: card._id.toString(),
                    title: card.title,
                    embedding: card.embedding
                };
            })
        );

        // Perform clustering
        const clusters = clusterCards(cardsWithEmbeddings, threshold || 0.7);

        // Build cluster metadata with labels
        const clusterArray = Array.from(clusters.entries()).map(([clusterId, cardIds]) => {
            const clusterCards = cards.filter(card => cardIds.includes(card._id.toString()));
            
            // Generate cluster label from most common words
            const allWords = clusterCards
                .map(c => `${c.title} ${c.description}`)
                .join(' ')
                .toLowerCase()
                .split(/\s+/)
                .filter(w => w.length > 3);
            
            const wordFreq = new Map<string, number>();
            allWords.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });
            
            const topWords = Array.from(wordFreq.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([word]) => word);
            
            const label = topWords.length > 0 
                ? topWords.join(' & ') 
                : clusterCards[0]?.title.substring(0, 20) || 'Unnamed Cluster';

            return {
                clusterId,
                label: label.charAt(0).toUpperCase() + label.slice(1),
                cardIds,
                cardCount: cardIds.length,
                cards: clusterCards.map(c => ({
                    _id: c._id,
                    title: c.title,
                    description: c.description
                }))
            };
        });

        // Update cards with cluster IDs in database
        for (const cluster of clusterArray) {
            await Card.updateMany(
                { _id: { $in: cluster.cardIds } },
                { clusterId: cluster.clusterId }
            );
        }

        console.log(`✅ Clustering complete: ${clusterArray.length} clusters created`);

        res.json({ 
            clusters: clusterArray,
            stats: {
                totalCards: cards.length,
                clustersCreated: clusterArray.length,
                averageClusterSize: cards.length / clusterArray.length,
                threshold: threshold || 0.7
            }
        });
    } catch (error) {
        console.error('❌ Error clustering cards:', error);
        res.status(500).json({ message: 'Server error', error: String(error) });
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
