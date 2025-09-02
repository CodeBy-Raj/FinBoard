
'use server';

import alphavantage from 'alphavantage';
import { subDays, format, parseISO } from 'date-fns';

const alpha = alphavantage({ key: process.env.ALPHA_VANTAGE_API_KEY || 'demo' });

export async function getHistoricalData(ticker: string): Promise<any[] | { error: string }> {
  try {
    const rawData = await alpha.data.daily(ticker, 'compact', 'json');

    // Handle API rate limiting by checking for the note in the response
    if (typeof rawData === 'object' && rawData !== null && 'Note' in rawData && typeof rawData.Note === 'string' && rawData.Note.includes('API call frequency')) {
        console.warn(`Rate limit hit for ${ticker}. Returning empty data.`);
        return []; // Return empty array instead of an error to avoid breaking the UI
    }

    const timeSeries = rawData['Time Series (Daily)'];
    if (!timeSeries) {
      // Don't return an error here either, just an empty array.
      // This could be due to an invalid symbol or other API issue.
      console.warn(`No historical data found for ${ticker}.`);
      return [];
    }

    // Get data for the last 30 days
    const endDate = new Date();
    const startDate = subDays(endDate, 30);

    const formattedData = Object.entries(timeSeries)
      .map(([date, values]) => {
        // Ensure date is parsed correctly to avoid timezone issues.
        const itemDate = parseISO(date);
        return {
          date: itemDate.toISOString(), // Use ISO string for consistency
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
        };
      })
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort ascending by date

    return formattedData;

  } catch (error: any) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    // Check for rate limit error in the catch block as well, as some errors might be thrown
    if (error.message && error.message.includes("Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 100 calls per day.")) {
        console.warn(`Rate limit hit for ${ticker} in catch block. Returning empty data.`);
        return []; // Return empty array
    }
    return { error: `Failed to fetch historical data for ${ticker}.` };
  }
}
