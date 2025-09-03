
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { removeAsset } from '@/lib/redux/slices/portfolioSlice';
import type { PortfolioAssetWithData } from './client';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface AssetsTableProps {
  assets: PortfolioAssetWithData[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

export function AssetsTable({ assets, loading }: AssetsTableProps) {
  const dispatch = useAppDispatch();

  if (loading) {
      return <Skeleton className="h-64 w-full" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Shares</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Market Value</TableHead>
          <TableHead>Total Gain/Loss</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assets.length > 0 ? assets.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-medium">{asset.ticker}</TableCell>
            <TableCell>{asset.shares}</TableCell>
            <TableCell>{formatCurrency(asset.currentPrice)}</TableCell>
            <TableCell>{formatCurrency(asset.marketValue)}</TableCell>
            <TableCell
              className={cn({
                'text-accent': asset.gainLoss > 0,
                'text-destructive': asset.gainLoss < 0,
              })}
            >
              {formatCurrency(asset.gainLoss)} ({asset.gainLossPercent.toFixed(2)}%)
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => dispatch(removeAsset(asset.id))} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                    No assets in portfolio. Click "Add Asset" to get started.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
