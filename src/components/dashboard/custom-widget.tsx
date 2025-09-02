
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

interface CustomWidgetProps {
  config: {
    id: string;
    name: string;
    apiUrl: string;
    refreshInterval: number;
    displayType: 'card' | 'table' | 'chart';
    fields: string[];
  };
}

// Utility to get a nested value from an object using a string path
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};


export function CustomWidget({ config }: CustomWidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(config.apiUrl);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [config.apiUrl]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, config.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchData, config.refreshInterval]);


  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-48 w-full" />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <p className="font-semibold">Error</p>
          <p className="text-xs text-center px-4">{error}</p>
        </div>
      );
    }

    if (!data) {
      return (
         <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available.
        </div>
      );
    }
    
    const displayData = config.fields.map(field => ({
        label: field,
        value: getNestedValue(data, field)
    }));

    switch (config.displayType) {
        case 'card':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {displayData.map(item => (
                        <div key={item.label} className="bg-secondary/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground truncate" title={item.label}>{item.label}</p>
                            <p className="text-lg font-semibold">{String(item.value)}</p>
                        </div>
                    ))}
                </div>
            )
        case 'table':
            return (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Field</TableHead>
                            <TableHead>Value</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayData.map(item => (
                            <TableRow key={item.label}>
                                <TableCell className="font-medium">{item.label}</TableCell>
                                <TableCell>{String(item.value)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )
         case 'chart':
            const chartData = displayData.filter(d => !isNaN(parseFloat(d.value))).map(d => ({ name: d.label, value: parseFloat(d.value)}));
            return (
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tick={false}/>
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                </ChartContainer>
            )
      default:
        return <p>Invalid display type.</p>;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{config.name}</CardTitle>
        <CardDescription className="text-xs flex items-center gap-1">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`}/>
          Refreshes every {config.refreshInterval}s
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
