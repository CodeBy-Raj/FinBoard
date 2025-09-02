'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { StockData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

type SortKey = keyof StockData;
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' };

const SEARCH_LS_KEY = 'finboard.stock_table.search';
const SORT_LS_KEY = 'finboard.stock_table.sort';

export function StockTableWidget({ stocks: initialStocks, itemsPerPage = 5 }: { stocks: StockData[], itemsPerPage?: number }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const savedSearch = localStorage.getItem(SEARCH_LS_KEY);
    if (savedSearch) setSearchTerm(savedSearch);

    const savedSort = localStorage.getItem(SORT_LS_KEY);
    if (savedSort) setSortConfig(JSON.parse(savedSort));
  }, []);

  React.useEffect(() => {
    localStorage.setItem(SEARCH_LS_KEY, searchTerm);
  }, [searchTerm]);

  React.useEffect(() => {
    if (sortConfig) {
      localStorage.setItem(SORT_LS_KEY, JSON.stringify(sortConfig));
    }
  }, [sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const filteredStocks = React.useMemo(() => {
    return initialStocks.filter(stock =>
      stock.ticker.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialStocks, searchTerm]);

  const sortedAndFilteredStocks = React.useMemo(() => {
    let data = [...filteredStocks];
    if (sortConfig !== null) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return data;
  }, [filteredStocks, sortConfig]);

  const paginatedStocks = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredStocks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredStocks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredStocks.length / itemsPerPage);

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Watchlist</CardTitle>
        <CardDescription>A collection of your favorite stocks.</CardDescription>
        <Input
          placeholder="Filter by ticker..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="mt-2"
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('ticker')} className="cursor-pointer">
                <div className="flex items-center">Symbol {getSortIcon('ticker')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('price')} className="cursor-pointer text-right">
                 <div className="flex items-center justify-end">Price {getSortIcon('price')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('changePercent')} className="cursor-pointer text-right">
                 <div className="flex items-center justify-end">Change % {getSortIcon('changePercent')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('volume')} className="cursor-pointer text-right">
                 <div className="flex items-center justify-end">Volume {getSortIcon('volume')}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStocks.length > 0 ? paginatedStocks.map((stock) => (
              <TableRow key={stock.ticker}>
                <TableCell className="font-medium">{stock.ticker}</TableCell>
                <TableCell className="text-right">{`$${stock.price.toFixed(2)}`}</TableCell>
                <TableCell
                  className={cn('text-right', {
                    'text-accent': stock.changePercent > 0,
                    'text-destructive': stock.changePercent < 0,
                  })}
                >
                  {stock.changePercent.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">{Number(stock.volume).toLocaleString()}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">No results found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
