
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { StockHistory } from '@/lib/types';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';


const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

const LOCAL_STORAGE_KEY = 'finboard.stock_chart.active_ticker';

// The history prop is now expected to be an object where keys are tickers
// and values are arrays of historical data points from the new action.
export function StockChartWidget({ history }: { history: { [ticker: string]: any[] } }) {
  const tickers = Object.keys(history);
  const [activeTicker, setActiveTicker] = React.useState(tickers[0] || '');

  React.useEffect(() => {
    const savedTicker = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTicker && tickers.includes(savedTicker)) {
      setActiveTicker(savedTicker);
    } else if (tickers.length > 0) {
      setActiveTicker(tickers[0]);
    }
  }, [tickers]);

  React.useEffect(() => {
    if (activeTicker) {
      localStorage.setItem(LOCAL_STORAGE_KEY, activeTicker);
    }
  }, [activeTicker]);


  const activeHistory = useMemo(() => {
    // The data is already sorted by the server action
    return (history[activeTicker] || [])
      .filter(item => !!item.date) // Filter out items without a date
      .map(item => ({
        ...item,
        // Format date for display on the chart's X-axis
        date: format(parseISO(item.date), 'MMM d'),
    }));
  }, [history, activeTicker]);


  const yDomain = useMemo(() => {
    if (activeHistory.length === 0) return [0, 100];
    const prices = activeHistory.map(item => item.close).filter(Boolean);
    if (prices.length === 0) return [0, 100];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.2 || 10;
    return [Math.max(0, min - padding), max + padding];
  }, [activeHistory]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-headline">Market Performance</CardTitle>
          <CardDescription>
            {activeTicker ? `Showing 30-day price history for ${activeTicker}` : "Select a stock to view its performance"}
          </CardDescription>
        </div>
        <Select
          value={activeTicker}
          onValueChange={setActiveTicker}
          disabled={tickers.length === 0}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select stock"
          >
            <SelectValue placeholder="Select stock" />
          </SelectTrigger>
          <SelectContent>
            {tickers.map((ticker) => (
              <SelectItem key={ticker} value={ticker} className="rounded-lg">
                {ticker}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {activeHistory.length > 0 ? (
            <LineChart
              data={activeHistory}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                domain={yDomain}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                    formatter={(value, name, props) => {
                       if (props.payload && props.payload.close !== undefined) {
                          const { open, high, low } = props.payload;
                          return (
                             <div>
                                <p className="font-semibold">{props.payload.date}</p>
                                <p>Close: ${Number(value).toFixed(2)}</p>
                                <p>Open: ${open.toFixed(2)}</p>
                                <p>High: ${high.toFixed(2)}</p>
                                <p>Low: ${low.toFixed(2)}</p>
                             </div>
                          )
                       }
                       return null;
                    }}
                    indicator="dot" 
                />}
              />
              <Line
                dataKey="close"
                type="natural"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </LineChart>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              No historical data available. This may be due to API rate limits.
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
