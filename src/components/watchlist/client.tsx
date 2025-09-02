'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { StockData } from '@/lib/types';
import { getRealTimeData } from '@/app/actions';
import { getHistoricalData } from '@/app/actions/get-historical-data';
import { StockChartWidget } from '@/components/dashboard/stock-chart-widget';
import { StockTableWidget } from '@/components/dashboard/stock-table-widget';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsWidget } from '@/components/dashboard/news-widget';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const ALL_TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'V', 'PYPL', 'DIS', 'NFLX', 'INTC', 'PFE', 'KO', 'PEP', 'MCD'];

interface HistoricalData {
  [ticker: string]: any[];
}

export function WatchlistClient() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTicker, setNewTicker] = useState('');
  const [tickers, setTickers] = useState(ALL_TICKERS.slice(0, 8));
  const [isFetchingHistorical, setIsFetchingHistorical] = useState(false);
  
  // Use a ref to track if the component is mounted to avoid state updates on unmounted components
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  const addTicker = () => {
    const upperCaseTicker = newTicker.toUpperCase();
    if (upperCaseTicker && !tickers.includes(upperCaseTicker)) {
      setTickers([...tickers, upperCaseTicker]);
      setNewTicker('');
    }
  };

  // Function to introduce a delay
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchAllData = useCallback(async (currentTickers: string[]) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real-time data first
      const realTimeResult = await getRealTimeData(currentTickers);
      if (!isMounted.current) return;

      if (realTimeResult && 'error' in realTimeResult) {
        setError(realTimeResult.error);
      } else if (realTimeResult.stockData) {
        setStocks(realTimeResult.stockData);
      }
    } catch (e) {
      console.error(e);
      if (isMounted.current) setError('Failed to fetch real-time data.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
    
    // Now fetch historical data sequentially to avoid rate limiting
    if (isMounted.current) setIsFetchingHistorical(true);

    const newHistoricalData: HistoricalData = {};
    for (const ticker of currentTickers) {
        if (!isMounted.current) return;
        try {
            const result = await getHistoricalData(ticker);
            if (isMounted.current) {
                if (result && !('error' in result)) {
                    newHistoricalData[ticker] = result;
                    // Update state incrementally to show charts as they load
                    setHistoricalData(prev => ({ ...prev, [ticker]: result }));
                } else {
                    console.warn(`Could not fetch historical data for ${ticker}`);
                    // Optionally set an error for this specific ticker
                }
            }
             // Wait for 15 seconds before the next call to stay under the 5 calls/minute limit
            await sleep(15000); 
        } catch (e) {
            console.error(`Error fetching historical data for ${ticker}:`, e);
        }
    }
    if (isMounted.current) setIsFetchingHistorical(false);

  }, []);

  useEffect(() => {
    fetchAllData(tickers);
  }, [tickers, fetchAllData]);


  if (loading) {
    return (
      <div className="grid gap-4 md:gap-8 py-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
            <Skeleton className="h-96 rounded-lg lg:col-span-2" />
            <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 py-4">
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Data Fetching Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
       {isFetchingHistorical && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Fetching Historical Data</AlertTitle>
          <AlertDescription>
            Due to API rate limits, historical data for each stock is fetched sequentially with a delay. Charts will appear as data becomes available. Please be patient.
          </AlertDescription>
        </Alert>
      )}
      <Card>
          <CardHeader>
              <CardTitle>Manage Watchlist</CardTitle>
              <CardDescription>Add or remove stocks from your watchlist.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                      placeholder="Enter a ticker (e.g., AAPL)" 
                      value={newTicker} 
                      onChange={(e) => setNewTicker(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTicker()}
                  />
                  <Button onClick={addTicker} className="w-full sm:w-auto">Add Ticker</Button>
              </div>
          </CardContent>
      </Card>

      <div className="w-full">
          <StockTableWidget stocks={stocks} itemsPerPage={10} />
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 w-full">
        <div className="xl:col-span-2 grid auto-rows-max gap-4 md:gap-8">
            <StockChartWidget history={historicalData} />
        </div>
        <div className="grid auto-rows-max gap-4 md:gap-8">
            <NewsWidget />
        </div>
      </div>
    </div>
  );
}
