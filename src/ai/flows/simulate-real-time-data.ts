'use server';
/**
 * @fileOverview This file is not actively used for data simulation anymore.
 * It is kept for type definitions that are shared across the application.
 * The data fetching logic has been moved to src/app/actions.ts to use a real API.
 */

import {z} from 'genkit';

export const SimulateRealTimeDataInputSchema = z.object({
  tickers: z.array(z.string()).describe('The ticker symbols of the stocks to simulate.'),
  currentDate: z.string().describe('The current ISO date string.'),
});
export type SimulateRealTimeDataInput = z.infer<typeof SimulateRealTimeDataInputSchema>;

export const SimulateRealTimeDataOutputSchema = z.object({
  stockData: z.array(z.object({
    ticker: z.string().describe('The ticker symbol of the stock.'),
    price: z.number().describe('The current price of the stock.'),
    timestamp: z.string().describe('The timestamp of the data.'),
    change: z.number().describe('The change in price.'),
    changePercent: z.number().describe('The percentage change in price.'),
    volume: z.string().describe('The trading volume.'),
  })).describe('The simulated real-time stock data.'),
});
export type SimulateRealTimeDataOutput = z.infer<typeof SimulateRealTimeDataOutputSchema>;
