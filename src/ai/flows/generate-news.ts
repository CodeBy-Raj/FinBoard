'use server';
/**
 * @fileOverview Generates a list of financial news articles.
 *
 * - generateNews - A function that creates a list of news articles.
 * - GenerateNewsOutput - The return type for the generateNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsOutputSchema = z.object({
  articles: z.array(z.object({
    headline: z.string().describe('The headline of the news article.'),
    summary: z.string().describe('A brief summary of the news article.'),
    source: z.string().describe('The source of the news (e.g., Bloomberg, Reuters).'),
    url: z.string().url().describe('The URL to the full article.'),
    imageUrl: z.string().url().describe('The URL for a relevant image for the article.'),
    publishedAt: z.string().datetime().describe('The ISO 8601 timestamp of when the article was published.'),
  })).describe('A list of generated financial news articles.'),
});
export type GenerateNewsOutput = z.infer<typeof GenerateNewsOutputSchema>;

export async function generateNews(): Promise<GenerateNewsOutput> {
  return generateNewsFlow();
}

const prompt = ai.definePrompt({
  name: 'generateNewsPrompt',
  output: {schema: GenerateNewsOutputSchema},
  prompt: `You are a financial news generator. Create a list of 5 recent, realistic, and engaging financial news articles. 
  
  For each article, provide:
  - A compelling headline.
  - A summary of the article's content (2-3 sentences).
  - A fictional but realistic source (e.g., Bloomberg, Reuters, Financial Times).
  - A placeholder URL to a full article (e.g., https://example.com/news/article-name).
  - A placeholder image URL from picsum.photos. The image should be 400px wide and 225px high.
  - A realistic publication timestamp within the last 24 hours.
  
  Ensure the topics are diverse and relevant to the current global financial climate.
  `,
});

const generateNewsFlow = ai.defineFlow(
  {
    name: 'generateNewsFlow',
    outputSchema: GenerateNewsOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
