'use client';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StockData } from '@/lib/types';
import { useMemo } from 'react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function FinanceCards({ stocks }: { stocks: StockData[] }) {
  const { gainers, losers, mostActive, totalMarketValue } = useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return { gainers: [], losers: [], mostActive: [], totalMarketValue: 0 };
    }

    const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sortedByChange.slice(0, 1);
    const losers = sortedByChange.slice(-1);
    
    const mostActive = [...stocks].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume)).slice(0,1);

    const totalMarketValue = stocks.reduce((acc, stock) => acc + stock.price, 0);

    return { gainers, losers, mostActive, totalMarketValue };
  }, [stocks]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalMarketValue)}</div>
          <p className="text-xs text-muted-foreground">Across all monitored stocks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
          <ArrowUp className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
            {gainers.length > 0 ? (
                <>
                    <div className="text-2xl font-bold">{gainers[0].ticker}</div>
                    <p className="text-xs text-accent">
                        +{gainers[0].changePercent.toFixed(2)}%
                    </p>
                </>
            ) : (
                <div className="text-sm text-muted-foreground">N/A</div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
          <ArrowDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
            {losers.length > 0 ? (
                 <>
                    <div className="text-2xl font-bold">{losers[0].ticker}</div>
                    <p className="text-xs text-destructive">
                        {losers[0].changePercent.toFixed(2)}%
                    </p>
                </>
            ) : (
                <div className="text-sm text-muted-foreground">N/A</div>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Active</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {mostActive.length > 0 ? (
                <>
                    <div className="text-2xl font-bold">{mostActive[0].ticker}</div>
                    <p className="text-xs text-muted-foreground">
                        Volume: {mostActive[0].volume}
                    </p>
                </>
            ) : (
                <div className="text-sm text-muted-foreground">N/A</div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
