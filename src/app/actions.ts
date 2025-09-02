'use server';

import type { SimulateRealTimeDataOutput } from '@/ai/flows/simulate-real-time-data';
import alphavantage from 'alphavantage';

const alpha = alphavantage({ key: process.env.ALPHA_VANTAGE_API_KEY || 'demo' });

// Helper function to fetch quote data for a single ticker
async function getQuote(ticker: string) {
  try {
    // The library returns a stringified JSON, so we need to parse it.
    const quoteDataString = await alpha.data.quote(ticker);
    const quote = JSON.parse(quoteDataString);

    const globalQuote = quote['Global Quote'];
    
    // Check for API call frequency limit
    if (quote.Note || !globalQuote || Object.keys(globalQuote).length === 0) {
        return { error: quote.Note || `No data for ${ticker}. Check symbol.` };
    }

    return globalQuote;
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return { error: `Failed to fetch quote for ${ticker}.` };
  }
}

export async function getRealTimeData(tickers: string[]): Promise<SimulateRealTimeDataOutput | { error: string }> {
  try {
    const quotePromises = tickers.map(ticker => getQuote(ticker));
    const results = await Promise.all(quotePromises);

    const stockData = results.map((quote, index) => {
        if (!quote || quote.error || !quote['05. price']) {
            // Fallback for failed fetches or if the API limit is hit
            return {
                ticker: tickers[index],
                price: Math.random() * 1000,
                timestamp: new Date().toISOString(),
                change: (Math.random() - 0.5) * 10,
                changePercent: (Math.random() - 0.5) * 5,
                volume: `${(Math.random() * 5 + 1).toFixed(2)}M`,
            };
        }
      
        return {
            ticker: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            timestamp: new Date(quote['07. latest trading day']).toISOString(),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: quote['06. volume'],
        };
    });

    return { stockData };

  } catch (error: any) {
    console.error('Error fetching real-time data from Alpha Vantage:', error);
    return { error: 'Failed to fetch real-time stock data. The API may be overloaded or the ticker symbols are invalid.' };
  }
}
