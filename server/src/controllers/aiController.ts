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

        console.log(`📊 Summarizing board with ${cards.length} cards`);

        // Prepare card data with full context
        const cardsData = cards.map(card => ({
            title: card.title,
            description: card.description,
            mood: card.mood,
            clusterId: card.clusterId,
            columnId: card.columnId.toString()
        }));

        // Get columns for context
        const columns = await Card.aggregate([
            { $match: { boardId: boardId } },
            { $group: { _id: '$columnId', count: { $sum: 1 } } }
        ]);

        const summary = await generateBoardSummary(cardsData, {
            totalCards: cards.length,
            columnsCount: columns.length
        });

        res.json({ summary });
    } catch (error) {
        console.error('❌ Error summarizing board:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const clusterBoardCards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { boardId, threshold } = req.body;

        console.log('🎯 Clustering request:', { boardId, threshold: threshold || 0.3 });

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
                    console.log(`🔄 Generating embedding for card: "${card.title}"`);
                    const embedding = await generateEmbedding(`${card.title} ${card.description}`);
                    card.embedding = embedding;
                    await card.save();
                }
                return {
                    id: card._id.toString(),
                    title: card.title,
                    description: card.description,
                    embedding: card.embedding
                };
            })
        );

        // Log similarities between all cards for debugging
        console.log('\n🔍 Similarity Matrix:');
        for (let i = 0; i < cardsWithEmbeddings.length; i++) {
            for (let j = i + 1; j < cardsWithEmbeddings.length; j++) {
                const sim = cosineSimilarity(
                    cardsWithEmbeddings[i].embedding,
                    cardsWithEmbeddings[j].embedding
                );
                console.log(`   "${cardsWithEmbeddings[i].title}" ↔ "${cardsWithEmbeddings[j].title}": ${sim.toFixed(4)}`);
            }
        }

        // Use lower default threshold for better grouping
        const effectiveThreshold = threshold || 0.3;
        console.log(`\n🎯 Using threshold: ${effectiveThreshold}`);

        // Perform clustering
        const clusters = clusterCards(cardsWithEmbeddings, effectiveThreshold);

        // Build cluster metadata with labels
        const clusterArray = Array.from(clusters.entries()).map(([clusterId, cardIds]) => {
            const clusterCards = cards.filter((card: any) => cardIds.includes(card._id.toString()));

            // Generate cluster label from most common words (improved)
            const allText = clusterCards
                .map((c: any) => `${c.title} ${c.description}`)
                .join(' ')
                .toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 3);

            // Remove common words
            const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'will', 'your', 'their', 'system', 'platform', 'powered']);
            const meaningfulWords = allText.filter(w => !stopWords.has(w));

            const wordFreq = new Map<string, number>();
            meaningfulWords.forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });

            const topWords = Array.from(wordFreq.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2)
                .map(([word]) => word);

            let label: string;
            if (topWords.length > 0) {
                label = topWords.join(' & ');
            } else {
                label = clusterCards[0]?.title.substring(0, 25) || 'Group';
            }

            console.log(`📦 ${clusterId}: "${label}" (${cardIds.length} cards)`);
            console.log(`   Cards: ${clusterCards.map((c: any) => c.title).join(', ')}`);

            return {
                clusterId,
                label: label.charAt(0).toUpperCase() + label.slice(1),
                cardIds,
                cardCount: cardIds.length,
                cards: clusterCards.map((c: any) => ({
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
                threshold: threshold || 0.3
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

        console.log(`🔍 Search request: "${query}" on board ${boardId}`);

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
        console.log(`📋 Found ${cards.length} cards to search`);

        if (cards.length === 0) {
            res.json({ cards: [] });
            return;
        }

        const queryEmbedding = await generateEmbedding(query);
        console.log(`🧮 Query embedding generated (magnitude: ${Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0)).toFixed(3)})`);

        const cardsWithSimilarity = await Promise.all(
            cards.map(async (card) => {
                // Force regenerate embeddings to use the improved algorithm
                // TODO: Add version tracking to embeddings in production
                console.log(`  🔄 Generating embedding for: "${card.title}"`);
                const embedding = await generateEmbedding(`${card.title} ${card.description}`);
                card.embedding = embedding;
                await card.save();

                const similarity = cosineSimilarity(queryEmbedding, card.embedding);

                console.log(`  📊 "${card.title}": ${similarity.toFixed(4)} similarity`);

                return {
                    card,
                    similarity
                };
            })
        );

        // Lower threshold to 0.2 for better results with hash-based embeddings
        // Hash-based embeddings typically produce lower similarity scores than neural embeddings
        const threshold = 0.2;
        const sortedCards = cardsWithSimilarity
            .filter(item => item.similarity > threshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .map(item => item.card);

        console.log(`✅ Returning ${sortedCards.length} cards (threshold: ${threshold})`);

        res.json({ cards: sortedCards });
    } catch (error) {
        console.error('❌ Search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
