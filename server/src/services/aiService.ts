import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const generateIdeasuggestions = async (cardTitle: string, cardDescription: string, boardContext: string[]): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a creative brainstorming assistant. Given a new idea card and existing board context, suggest 2-3 related creative ideas that complement or expand on the original idea.

New Card:
Title: ${cardTitle}
Description: ${cardDescription}

Existing Board Ideas:
${boardContext.slice(0, 10).join('\n')}

Generate exactly 3 creative, related ideas. Return only the ideas as a JSON array of strings, nothing else.
Example format: ["Idea 1", "Idea 2", "Idea 3"]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return response.split('\n').filter(line => line.trim()).slice(0, 3);
  } catch (error) {
    console.error('Error generating ideas:', error);
    return [];
  }
};

export const generateBoardSummary = async (cards: Array<{ title: string; description: string }>): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const cardsText = cards.map(card => `- ${card.title}: ${card.description}`).join('\n');
    
    const prompt = `Analyze the following brainstorming board and provide a comprehensive summary:

Board Ideas:
${cardsText}

Provide a summary with:
1. Key Themes (2-3 main topics)
2. Top Ideas (3-5 most impactful ideas)
3. Possible Next Steps (3-4 actionable recommendations)

Format as markdown with clear sections.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary at this time.';
  }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
};

export const analyzeMood = async (text: string): Promise<'positive' | 'neutral' | 'negative'> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Analyze the sentiment/mood of the following text and respond with ONLY one word: positive, neutral, or negative.

Text: ${text}

Sentiment:`;

    const result = await model.generateContent(prompt);
    const sentiment = result.response.text().trim().toLowerCase();
    
    if (sentiment.includes('positive')) return 'positive';
    if (sentiment.includes('negative')) return 'negative';
    return 'neutral';
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
