
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { StockData, StockHistory } from '@/lib/types';
import { getRealTimeData } from '@/app/actions';
import { FinanceCards } from './finance-cards';
import { StockChartWidget } from './stock-chart-widget';
import { StockTableWidget } from './stock-table-widget';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsWidget } from './news-widget';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, MinusCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { removeWidget, setWidgets, selectWidgets } from '@/lib/redux/slices/widgetsSlice';
import { Button } from '../ui/button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from './sortable-widget';
import { cn } from '@/lib/utils';
import { AddWidgetDialog } from './add-widget-dialog';
import { CustomWidget } from './custom-widget';

const TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'V'];
const MAX_HISTORY_LENGTH = 50;

const widgetComponents: { [key: string]: React.FC<any> } = {
  financeCards: FinanceCards,
  stockChart: StockChartWidget,
  stockTable: StockTableWidget,
  news: NewsWidget,
  custom: CustomWidget,
};

export function DashboardClient() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [history, setHistory] = useState<StockHistory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const widgets = useAppSelector(selectWidgets);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over?.id);
      dispatch(setWidgets(arrayMove(widgets, oldIndex, newIndex)));
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const result = await getRealTimeData(TICKERS);
      
      if (result && 'error' in result && typeof result.error === 'string') {
        setError(result.error);
        return;
      }

      if (error) setError(null);
      
      const data = result.stockData || [];

      setStocks((currentStocks) => {
        const newStocks: StockData[] = data.map((newStock) => {
          const existingStock = currentStocks.find((s) => s.ticker === newStock.ticker);
          const oldPrice = existingStock?.price ?? newStock.price;
          const change = newStock.price - oldPrice;
          const changePercent = oldPrice === 0 ? 0 : (change / oldPrice) * 100;

          return {
            ...newStock,
            change,
            changePercent,
            volume: newStock.volume,
          };
        });
        return newStocks;
      });

      setHistory((prevHistory) => {
        const newHistory = { ...prevHistory };
        data.forEach((stock) => {
          if (!stock.timestamp || !stock.price) return;
          const historyEntry = {
            x: new Date(stock.timestamp).toLocaleTimeString(),
            y: stock.price,
          };
          const tickerHistory = newHistory[stock.ticker]
            ? [...newHistory[stock.ticker], historyEntry]
            : [historyEntry];
          
          if (tickerHistory.length > MAX_HISTORY_LENGTH) {
            tickerHistory.shift();
          }
          newHistory[stock.ticker] = tickerHistory;
        });
        return newHistory;
      });

    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred. Please try again later.');
    }
  }, [error]);

  useEffect(() => {
    // Initial fetch
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);
  
  useEffect(() => {
    if (!loading) {
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }
  }, [loading, fetchData]);


  if (loading) {
    return (
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 col-span-1 lg:col-span-3 xl:col-span-3">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <Skeleton className="h-96 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2" />
        <Skeleton className="h-96 rounded-lg col-span-1" />
        <Skeleton className="h-96 rounded-lg col-span-1 lg:col-span-3 xl:col-span-3" />
      </div>
    );
  }

  const renderWidget = (widget: { id: string; type: string; gridColumn?: string; config?: any }) => {
    const WidgetComponent = widgetComponents[widget.type];
    if (!WidgetComponent) return null;

    const props: any = {};
    if (widget.type === 'stockChart') props.history = history;
    if (widget.type === 'stockTable') {
        props.stocks = stocks;
        props.itemsPerPage = 5;
    };
    if (widget.type === 'custom') {
        props.config = widget.config;
    }
    
    return (
        <SortableWidget key={widget.id} id={widget.id} gridColumn={widget.gridColumn}>
             <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-6 w-6"
                onClick={() => dispatch(removeWidget(widget.id))}
            >
                <MinusCircle className="h-4 w-4" />
            </Button>
            <WidgetComponent {...props} />
        </SortableWidget>
    )
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8 py-4">
       {error && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Data Fetching Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end">
        <AddWidgetDialog />
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {widgets.map(widget => {
                  if (widget.type === 'financeCards') {
                    // Special rendering for finance cards to span across columns
                    return (
                       <SortableWidget key={widget.id} id={widget.id} gridColumn={cn('lg:col-span-3', widget.gridColumn)}>
                         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8 relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-10 h-6 w-6"
                                onClick={() => dispatch(removeWidget(widget.id))}
                            >
                                <MinusCircle className="h-4 w-4" />
                            </Button>
                            <FinanceCards stocks={stocks} />
                         </div>
                       </SortableWidget>
                    )
                  }
                  return renderWidget(widget);
                })}
            </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
