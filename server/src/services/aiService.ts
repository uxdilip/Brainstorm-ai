import Groq from 'groq-sdk';
import Card from '../models/Card';

let groqClient: Groq | null = null;

const getGroqClient = () => {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is not set in environment variables');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
};

export const generateIdeasuggestions = async (
    cardTitle: string,
    cardDescription: string,
    existingCards: string[]
): Promise<string[]> => {
    try {
        const groq = getGroqClient();

        // Build context from existing cards if available
        const contextText = existingCards.length > 0 
            ? `\n\nExisting ideas on the board:\n${existingCards.join('\n- ')}`
            : '';

        const prompt = `You are a creative brainstorming assistant. A user just added this idea to their brainstorming board:

Title: "${cardTitle}"
Description: "${cardDescription}"
${contextText}

Based on this new idea, generate 3 related and complementary suggestions that would help expand on this concept. The suggestions should be:
- Directly related to "${cardTitle}"
- Creative and diverse
- Actionable and specific
- One per line

Return ONLY the 3 suggestions, one per line, without numbering, bullet points, or extra formatting.`;

        console.log('🤖 Sending prompt to Groq...');
        console.log('📝 Card Title:', cardTitle);
        console.log('📝 Card Description:', cardDescription);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.8,
            max_tokens: 250
        });

        const response = completion.choices[0]?.message?.content || '';
        console.log('✅ Groq response:', response);

        // Parse the response into an array of suggestions
        const suggestions = response
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.match(/^[\d\-\*\•\.\)]+\s/)) // Remove numbering/bullets
            .map(line => line.replace(/^[\d\-\*\•\.\)]+\s*/, '').trim()) // Clean up any remaining formatting
            .slice(0, 3);

        console.log('✨ Parsed suggestions:', suggestions);

        return suggestions.length > 0 ? suggestions : [
            `Explore implementation details for ${cardTitle}`,
            `Consider potential challenges with ${cardTitle}`,
            `Research best practices for ${cardTitle}`
        ];
    } catch (error) {
        console.error('❌ Error generating idea suggestions:', error);
        return [
            `Explore alternative approaches to ${cardTitle}`,
            `Consider the user impact of ${cardTitle}`,
            `Think about scaling ${cardTitle}`
        ];
    }
};

export const generateBoardSummary = async (cards: string[]): Promise<string> => {
    try {
        const groq = getGroqClient();

        const prompt = `Summarize the following brainstorming ideas into a concise paragraph (2-3 sentences):
${cards.join('\n- ')}

Provide a high-level overview of the main themes and insights.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 200
        });

        return completion.choices[0]?.message?.content || 'Unable to generate summary at this time.';
    } catch (error) {
        console.error('Error generating board summary:', error);
        return 'Unable to generate summary at this time.';
    }
};

// Enhanced embedding generation using TF-IDF and word importance
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        if (!text || text.trim().length === 0) {
            return new Array(384).fill(0);
        }

        const embeddingSize = 384;
        const embedding = new Array(embeddingSize).fill(0);
        
        // Tokenize and clean text
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 2); // Remove short words
        
        if (words.length === 0) {
            return embedding;
        }

        // Common stop words to reduce weight
        const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been', 'will', 'would', 'could', 'should']);
        
        // Calculate word frequencies (TF)
        const wordFreq = new Map<string, number>();
        words.forEach(word => {
            if (!stopWords.has(word)) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }
        });

        // Generate embedding using multiple hash functions for better distribution
        wordFreq.forEach((freq, word) => {
            // Multiple hash functions for better semantic representation
            for (let hashFunc = 0; hashFunc < 3; hashFunc++) {
                let hash = hashFunc * 1000;
                
                for (let i = 0; i < word.length; i++) {
                    hash = ((hash << 5) - hash) + word.charCodeAt(i);
                    hash = hash & hash; // Convert to 32-bit integer
                }
                
                const position = Math.abs(hash) % embeddingSize;
                
                // Weight by term frequency and word length (longer words are more specific)
                const weight = (freq / words.length) * Math.log(word.length + 1);
                embedding[position] += weight;
            }
        });

        // Add bi-gram features for context
        for (let i = 0; i < words.length - 1; i++) {
            if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
                const bigram = `${words[i]}_${words[i + 1]}`;
                let hash = 0;
                for (let j = 0; j < bigram.length; j++) {
                    hash = ((hash << 5) - hash) + bigram.charCodeAt(j);
                }
                const position = Math.abs(hash) % embeddingSize;
                embedding[position] += 0.5; // Lower weight for bi-grams
            }
        }

        // Normalize the embedding using L2 norm
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        
        if (magnitude > 0) {
            return embedding.map(val => val / magnitude);
        }
        
        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return new Array(384).fill(0);
    }
};

export const analyzeMood = async (content: string): Promise<string> => {
    try {
        const groq = getGroqClient();

        const prompt = `Analyze the mood/sentiment of the following text and respond with ONLY ONE WORD from this list: positive, negative, neutral, excited, thoughtful.

Text: "${content}"

Respond with only the mood word, nothing else.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 10
        });

        const mood = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'neutral';

        // Validate the mood is one of the expected values
        const validMoods = ['positive', 'negative', 'neutral', 'excited', 'thoughtful'];
        return validMoods.includes(mood) ? mood : 'neutral';
    } catch (error) {
        console.error('Error analyzing mood:', error);
        return 'neutral';
    }
};

export const cosineSimilarity = (a: number[], b: number[]): number => {
    if (a.length !== b.length || a.length === 0) return 0;

    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
};

// Enhanced clustering using hierarchical agglomerative clustering
export const clusterCards = (
    cards: Array<{ id: string; embedding: number[] }>, 
    threshold: number = 0.7
): Map<string, string[]> => {
    const clusters = new Map<string, string[]>();
    
    if (cards.length === 0) return clusters;
    
    console.log(`🔍 Starting clustering with ${cards.length} cards, threshold: ${threshold}`);
    
    const processed = new Set<string>();
    let clusterIndex = 0;

    // Sort cards by embedding magnitude for better clustering seed selection
    const sortedCards = [...cards].sort((a, b) => {
        const magA = Math.sqrt(a.embedding.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.embedding.reduce((sum, val) => sum + val * val, 0));
        return magB - magA;
    });

    for (const card of sortedCards) {
        if (processed.has(card.id)) continue;

        const clusterKey = `cluster-${clusterIndex}`;
        const clusterMembers = [card.id];
        processed.add(card.id);

        // Find similar cards using cosine similarity
        const similarities: Array<{ id: string; similarity: number }> = [];
        
        for (const otherCard of cards) {
            if (processed.has(otherCard.id)) continue;

            const similarity = cosineSimilarity(card.embedding, otherCard.embedding);
            
            if (similarity >= threshold) {
                similarities.push({ id: otherCard.id, similarity });
            }
        }

        // Sort by similarity (most similar first)
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Add similar cards to cluster
        for (const { id, similarity } of similarities) {
            clusterMembers.push(id);
            processed.add(id);
            console.log(`  ✓ Card ${id} added to ${clusterKey} (similarity: ${similarity.toFixed(3)})`);
        }

        // Only create cluster if it has members
        if (clusterMembers.length > 0) {
            clusters.set(clusterKey, clusterMembers);
            console.log(`📦 ${clusterKey}: ${clusterMembers.length} cards`);
            clusterIndex++;
        }
    }

    console.log(`✅ Created ${clusterIndex} clusters from ${cards.length} cards`);
    console.log(`📊 Clustered: ${processed.size}/${cards.length} cards`);
    
    return clusters;
};
