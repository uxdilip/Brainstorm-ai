import { GoogleGenerativeAI } from '@google/generative-ai';

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
    boardTitle: string,
    existingCards: string[]
): Promise<string[]> => {
    try {
        const groq = getGroqClient();
        
        const prompt = `Given a brainstorming board titled "${boardTitle}" with existing ideas: ${existingCards.join(', ')}.
Generate 3 new creative and diverse ideas that complement the existing ones. Return only the ideas, one per line, without numbering or extra formatting.`;
        
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-70b-versatile',
            temperature: 0.8,
            max_tokens: 200
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        // Parse the response into an array of suggestions
        return response.split('\n').filter((line: string) => line.trim()).slice(0, 3);
    } catch (error) {
        console.error('Error generating idea suggestions:', error);
        return [
            'Explore alternative perspectives',
            'Consider the user experience',
            'Think about scalability'
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
            model: 'llama-3.1-70b-versatile',
            temperature: 0.5,
            max_tokens: 200
        });
        
        return completion.choices[0]?.message?.content || 'Unable to generate summary at this time.';
    } catch (error) {
        console.error('Error generating board summary:', error);
        return 'Unable to generate summary at this time.';
    }
};

// Simple embedding generation using word frequency and TF-IDF approach
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        // For now, use a simple hash-based approach to generate consistent embeddings
        // In production, you might want to use a dedicated embedding service
        const words = text.toLowerCase().split(/\s+/);
        const embedding = new Array(384).fill(0); // Standard embedding size
        
        // Generate a simple embedding based on word characteristics
        words.forEach((word, idx) => {
            const hash = word.split('').reduce((acc, char) => {
                return ((acc << 5) - acc) + char.charCodeAt(0);
            }, 0);
            
            const position = Math.abs(hash) % embedding.length;
            embedding[position] += 1 / (idx + 1); // Weight earlier words more
        });
        
        // Normalize the embedding
        const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
        return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
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
            model: 'llama-3.1-70b-versatile',
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

export const clusterCards = (cards: Array<{ id: string; embedding: number[] }>, threshold: number = 0.7): Map<string, string[]> => {
    const clusters = new Map<string, string[]>();
    const processed = new Set<string>();
    let clusterIndex = 0;

    for (const card of cards) {
        if (processed.has(card.id)) continue;

        const clusterKey = `cluster-${clusterIndex++}`;
        const clusterMembers = [card.id];
        processed.add(card.id);

        for (const otherCard of cards) {
            if (processed.has(otherCard.id)) continue;

            const similarity = cosineSimilarity(card.embedding, otherCard.embedding);

            if (similarity >= threshold) {
                clusterMembers.push(otherCard.id);
                processed.add(otherCard.id);
            }
        }

        if (clusterMembers.length > 0) {
            clusters.set(clusterKey, clusterMembers);
        }
    }

    return clusters;
};
