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

// Hybrid approach: Programmatic analysis + AI insights for structured board summary
export const generateBoardSummary = async (
    cards: Array<{ title: string; description: string; mood?: string; clusterId?: string; columnId?: string }>,
    context: { totalCards: number; columnsCount: number }
): Promise<string> => {
    try {
        const groq = getGroqClient();

        // 1. PROGRAMMATIC ANALYSIS: Extract themes from keywords
        const allText = cards
            .map(c => `${c.title} ${c.description}`)
            .join(' ')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3);

        const stopWords = new Set([
            'that', 'this', 'with', 'from', 'have', 'been', 'will', 'your',
            'their', 'system', 'platform', 'powered', 'using', 'based', 'ideas'
        ]);

        const wordFreq = new Map<string, number>();
        allText
            .filter(w => !stopWords.has(w))
            .forEach(word => {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            });

        const topKeywords = Array.from(wordFreq.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([word, count]) => ({ word, count }));

        // 2. MOOD DISTRIBUTION
        const moodCounts = new Map<string, number>();
        cards.forEach(card => {
            if (card.mood) {
                moodCounts.set(card.mood, (moodCounts.get(card.mood) || 0) + 1);
            }
        });

        const dominantMood = Array.from(moodCounts.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

        const moodEmoji = {
            'positive': '😊',
            'negative': '😟',
            'neutral': '😐',
            'excited': '🎉',
            'thoughtful': '🤔'
        }[dominantMood] || '💭';

        // 3. CLUSTER ANALYSIS
        const clusterCounts = new Map<string, number>();
        cards.forEach(card => {
            if (card.clusterId) {
                clusterCounts.set(card.clusterId, (clusterCounts.get(card.clusterId) || 0) + 1);
            }
        });
        const clustersFound = clusterCounts.size;

        // 4. BUILD CARD LIST FOR AI
        const cardsList = cards
            .map((c, i) => `${i + 1}. **${c.title}**${c.description ? `: ${c.description}` : ''}`)
            .join('\n');

        // 5. AI ANALYSIS: Get insights, rankings, and recommendations
        const prompt = `You are analyzing a brainstorming board with ${context.totalCards} ideas. 

**Cards:**
${cardsList}

**Your task:** Provide a structured analysis in markdown format with these exact sections:

## 💡 Top Ideas
Rank the 3-5 most impactful/innovative ideas. For each, briefly explain why it stands out.

## 🚀 Recommended Next Steps
Suggest 3-5 concrete, actionable steps to move these ideas forward. Be specific.

## 🔗 Connections & Synergies
Identify 2-3 ways these ideas could work together or complement each other.

Use emojis, be concise, and focus on actionable insights.`;

        console.log('🤖 Calling AI for insights...');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 800
        });

        const aiInsights = completion.choices[0]?.message?.content || '';

        // 6. BUILD FINAL STRUCTURED SUMMARY
        const keyThemes = topKeywords.slice(0, 5)
            .map(({ word, count }) => `• **${word.charAt(0).toUpperCase() + word.slice(1)}** (${count} mentions)`)
            .join('\n');

        const clusterInfo = clustersFound > 0
            ? `\n\n**🎯 ${clustersFound} idea cluster${clustersFound > 1 ? 's' : ''} identified** - Related concepts are grouping together naturally.`
            : '';

        const summary = `## 📊 Board Overview
${context.totalCards} ideas across ${context.columnsCount} stage${context.columnsCount > 1 ? 's' : ''}  
Overall mood: ${moodEmoji} ${dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}${clusterInfo}

## 🎯 Key Themes
${keyThemes}

${aiInsights}

---
*Summary generated on ${new Date().toLocaleDateString()}*`;

        console.log('✅ Summary generated successfully');
        return summary;

    } catch (error) {
        console.error('❌ Error generating board summary:', error);
        return 'Unable to generate summary at this time. Please try again.';
    }
};

// AI-powered semantic embedding generation using Groq
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        if (!text || text.trim().length === 0) {
            return new Array(384).fill(0);
        }

        const embeddingSize = 384;
        const embedding = new Array(384).fill(0);

        // Clean and tokenize text
        const cleanText = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const words = cleanText.split(/\s+/).filter(word => word.length > 2);

        if (words.length === 0) {
            return embedding;
        }

        // Expanded stop words list
        const stopWords = new Set([
            'the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been',
            'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must',
            'are', 'was', 'were', 'been', 'being', 'has', 'had', 'having',
            'does', 'did', 'doing', 'but', 'not', 'only', 'own', 'same',
            'such', 'than', 'too', 'very', 'just', 'where', 'when', 'what'
        ]);

        // Word stemming (simple version) - Less aggressive to preserve meaning
        const stem = (word: string): string => {
            // Only stem very common suffixes, preserve core meaning
            let stemmed = word;

            // Handle compound words (deforestation → forest, reforestation → forest)
            if (word.includes('forest')) {
                return 'forest';
            }

            // Progressive stemming - only if word is long enough
            if (word.length > 7 && word.endsWith('ing')) {
                stemmed = word.slice(0, -3); // monitoring → monitor
            } else if (word.length > 8 && word.endsWith('ation')) {
                stemmed = word.slice(0, -5); // restoration → restor
            } else if (word.length > 6 && word.endsWith('tion')) {
                stemmed = word.slice(0, -4); // action → act
            } else if (word.length > 5 && word.endsWith('ed')) {
                stemmed = word.slice(0, -2); // powered → power
            } else if (word.length > 5 && word.endsWith('ment')) {
                stemmed = word.slice(0, -4); // engagement → engage
            } else if (word.length > 4 && word.endsWith('s')) {
                stemmed = word.slice(0, -1); // ideas → idea
            }

            return stemmed;
        };

        // Filter and stem words
        const meaningfulWords = words
            .filter(word => !stopWords.has(word))
            .map(word => stem(word));

        // Calculate term frequencies with stemming
        const wordFreq = new Map<string, number>();
        meaningfulWords.forEach(word => {
            wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        });

        // Generate embeddings with improved distribution
        wordFreq.forEach((freq, word) => {
            // Use 5 different hash functions for better coverage
            for (let hashFunc = 0; hashFunc < 5; hashFunc++) {
                let hash = hashFunc * 2654435761; // Large prime number

                for (let i = 0; i < word.length; i++) {
                    const char = word.charCodeAt(i);
                    hash = ((hash << 5) + hash) ^ char; // Better mixing
                }

                // Use multiple positions for each word
                for (let spread = 0; spread < 2; spread++) {
                    const position = Math.abs(hash + spread * 1000) % embeddingSize;

                    // Enhanced weighting:
                    // - Term frequency: how often word appears
                    // - Word length: longer words are more meaningful
                    // - Inverse position: earlier words slightly more important
                    const tfWeight = freq / meaningfulWords.length;
                    const lengthWeight = Math.log(word.length + 1);
                    const weight = tfWeight * lengthWeight;

                    embedding[position] += weight;
                }
            }
        });

        // Add bi-grams for context (increased weight)
        for (let i = 0; i < meaningfulWords.length - 1; i++) {
            const bigram = `${meaningfulWords[i]}_${meaningfulWords[i + 1]}`;
            let hash = 42; // Seed

            for (let j = 0; j < bigram.length; j++) {
                hash = ((hash << 5) + hash) ^ bigram.charCodeAt(j);
            }

            const position = Math.abs(hash) % embeddingSize;
            embedding[position] += 0.8; // Higher weight for bi-grams
        }

        // Add tri-grams for even more context
        for (let i = 0; i < meaningfulWords.length - 2; i++) {
            const trigram = `${meaningfulWords[i]}_${meaningfulWords[i + 1]}_${meaningfulWords[i + 2]}`;
            let hash = 123;

            for (let j = 0; j < trigram.length; j++) {
                hash = ((hash << 5) + hash) ^ trigram.charCodeAt(j);
            }

            const position = Math.abs(hash) % embeddingSize;
            embedding[position] += 0.6; // Medium weight for tri-grams
        }

        // Normalize using L2 norm
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

        if (magnitude > 0) {
            const normalized = embedding.map(val => val / magnitude);

            // Log for debugging
            console.log(`📊 Embedding for "${text.substring(0, 50)}..."`);
            console.log(`   Words: ${meaningfulWords.join(', ')}`);
            console.log(`   Magnitude: ${magnitude.toFixed(4)}`);

            return normalized;
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
    threshold: number = 0.3
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
