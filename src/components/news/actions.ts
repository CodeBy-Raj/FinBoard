'use server';

import { generateNews } from "@/ai/flows/generate-news";
import type { GenerateNewsOutput } from "@/ai/flows/generate-news";

export async function getNews(): Promise<{ articles: GenerateNewsOutput['articles'] } | { error: string }> {
  try {
    const result = await generateNews();
    return { articles: result.articles };
  } catch (error: any) {
    console.error('Error generating news:', error);
     if (error.status === 'FAILED_PRECONDITION') {
        return { error: 'The news model is not configured. Please set the GEMINI_API_KEY in your .env file.' };
    }
    return { error: 'Failed to fetch news from the AI model.' };
  }
}
