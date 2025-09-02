'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  LayoutGrid,
  Table,
  BarChart,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addWidget } from '@/lib/redux/slices/widgetsSlice';

interface Field {
    path: string;
    type: string;
    value: string;
}

// Function to flatten a JSON object and return an array of fields
function flattenObject(obj: any, parentKey = '', result: Field[] = []): Field[] {
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flattenObject(value, newKey, result);
            } else {
                result.push({
                    path: newKey,
                    type: Array.isArray(value) ? 'array' : typeof value,
                    value: Array.isArray(value) ? '[...]' : String(value),
                });
            }
        }
    }
    return result;
}


export function AddWidgetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiUrl, setApiUrl] = useState('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
  const [widgetName, setWidgetName] = useState('Bitcoin Price');
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [availableFields, setAvailableFields] = useState<Field[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [displayType, setDisplayType] = useState<'card' | 'table' | 'chart'>('card');
  const dispatch = useAppDispatch();

  const handleTest = async () => {
    setTestStatus('testing');
    setAvailableFields([]);
    setSelectedFields([]);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableFields(flattenObject(data));
      setTestStatus('success');
    } catch (error) {
      console.error('API Test failed:', error);
      setTestStatus('error');
    }
  };
  
  const handleAddWidget = () => {
    const newWidget = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        gridColumn: 'lg:col-span-1',
        config: {
            name: widgetName,
            apiUrl,
            refreshInterval,
            displayType,
            fields: selectedFields,
        }
    };
    dispatch(addWidget(newWidget as any)); // We'll define a proper type later
    setIsOpen(false);
    // Reset state for next time
    setTestStatus('idle');
    setAvailableFields([]);
    setSelectedFields([]);
  }

  const toggleField = (fieldPath: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldPath) 
        ? prev.filter(p => p !== fieldPath)
        : [...prev, fieldPath]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" /> Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[650px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Add New Widget</DialogTitle>
          <DialogDescription>
            Configure a new widget by providing an API endpoint and selecting data fields.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="widget-name">Widget Name</Label>
            <Input id="widget-name" placeholder="E.g., Bitcoin Price" value={widgetName} onChange={e => setWidgetName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="api-url">API URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                placeholder="https://api.example.com/data"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
              />
              <Button variant="outline" onClick={handleTest} disabled={testStatus === 'testing'}>
                {testStatus === 'testing' ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
            {testStatus === 'success' && (
              <div className="flex items-center text-sm text-green-500">
                <CheckCircle className="mr-2 h-4 w-4" />
                API connection successful! {availableFields.length} fields found.
              </div>
            )}
            {testStatus === 'error' && (
              <div className="flex items-center text-sm text-destructive">
                <AlertCircle className="mr-2 h-4 w-4" />
                Failed to connect to API. Check the URL and CORS policy.
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
            <Input id="refresh-interval" type="number" placeholder="30" value={refreshInterval} onChange={e => setRefreshInterval(Number(e.target.value))} />
          </div>

          <div className="grid gap-4">
            <Label>Select Fields to Display</Label>
            <Tabs value={displayType} onValueChange={(value) => setDisplayType(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="card"><LayoutGrid className="mr-2"/>Card</TabsTrigger>
                <TabsTrigger value="table"><Table className="mr-2"/>Table</TabsTrigger>
                <TabsTrigger value="chart"><BarChart className="mr-2"/>Chart</TabsTrigger>
              </TabsList>
            </Tabs>

            <Input placeholder="Search for fields..." disabled={availableFields.length === 0} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Available Fields</h4>
                <ScrollArea className="h-48 rounded-md border p-2">
                  {availableFields.length > 0 ? (
                    <div className="space-y-2">
                      {availableFields.map(field => (
                        <div key={field.path} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary/50">
                          <div>
                            <p className="font-mono text-xs">{field.path}</p>
                            <p className="text-xs text-muted-foreground">{field.type} | {field.value}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleField(field.path)} disabled={selectedFields.includes(field.path)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        {testStatus === 'idle' && 'Test an API to see fields.'}
                        {testStatus === 'testing' && 'Testing...'}
                        {testStatus === 'error' && 'Could not fetch fields.'}
                    </div>
                  )}
                </ScrollArea>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Selected Fields</h4>
                 <ScrollArea className="h-48 rounded-md border p-2">
                   {selectedFields.length > 0 ? (
                    <div className="space-y-2">
                        {selectedFields.map(fieldPath => {
                            const field = availableFields.find(f => f.path === fieldPath);
                            return (
                                <div key={fieldPath} className="flex items-center justify-between text-sm p-2 rounded-md bg-secondary">
                                    <span className="font-mono text-xs">{fieldPath}</span>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleField(fieldPath)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                   ): (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No fields selected.
                    </div>
                   )}
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddWidget} disabled={selectedFields.length === 0}>Add Widget</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
