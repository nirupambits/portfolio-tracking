import { GoogleGenAI, Type } from '@google/genai';
import { PortfolioItem, InsightData } from '../types';

// Initialize the Gemini API client
// The API key is securely injected by the AI Studio platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractPortfolioData(base64Image: string, mimeType: string): Promise<Omit<PortfolioItem, 'id'>[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: 'Extract the portfolio holdings from this image. Return a JSON array of objects with the following keys: holdingName (string), ticker (string), shares (number), currentValue (number). If a ticker is not found or not applicable, leave it as an empty string. Ensure numbers do not contain currency symbols or commas.',
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              holdingName: { type: Type.STRING },
              ticker: { type: Type.STRING },
              shares: { type: Type.NUMBER },
              currentValue: { type: Type.NUMBER },
            },
            required: ['holdingName', 'ticker', 'shares', 'currentValue'],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error('No response from Gemini');
    }

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error('Error extracting portfolio data:', error);
    throw error;
  }
}

export async function extractPortfolioFromText(text: string): Promise<Omit<PortfolioItem, 'id'>[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          text: `Extract the portfolio holdings from this text: "${text}". Return a JSON array of objects with the following keys: holdingName (string), ticker (string), shares (number), currentValue (number). If a ticker is not found or not applicable, try to infer it from the holding name. If shares or currentValue are not provided, set them to 0. Ensure numbers do not contain currency symbols or commas.`,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              holdingName: { type: Type.STRING },
              ticker: { type: Type.STRING },
              shares: { type: Type.NUMBER },
              currentValue: { type: Type.NUMBER },
            },
            required: ['holdingName', 'ticker', 'shares', 'currentValue'],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error('No response from Gemini');
    }

    const data = JSON.parse(response.text);
    return data;
  } catch (error) {
    console.error('Error extracting portfolio data from text:', error);
    throw error;
  }
}

export async function analyzeTickers(tickers: string[]): Promise<InsightData[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: `Analyze the following stock tickers: ${tickers.join(', ')}.
      For each ticker, find the latest analyst ratings, target prices, and today's top news headline.
      Based on this data, provide a Sentiment Score (0-100) and a TPM Recommendation (Buy/Hold/Sell/Trim).
      
      You MUST return the result as a raw JSON array of objects. Do not include markdown formatting like \`\`\`json.
      Each object must have these exact keys:
      - ticker (string)
      - analystRatings (string)
      - targetPrice (string)
      - topHeadline (string)
      - sentimentScore (number)
      - recommendation (string: "Buy", "Hold", "Sell", or "Trim")
      - reasoning (string: brief explanation of the recommendation)
      `,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON array from the response text, handling potential markdown wrappers
    const text = response.text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as InsightData[];
    } else {
      console.error('Failed to parse JSON from response:', text);
      throw new Error('Failed to parse analysis results');
    }
  } catch (error) {
    console.error('Error analyzing tickers:', error);
    throw error;
  }
}
