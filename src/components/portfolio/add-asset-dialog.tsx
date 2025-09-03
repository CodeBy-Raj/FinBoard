
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
import { PlusCircle } from 'lucide-react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addAsset } from '@/lib/redux/slices/portfolioSlice';

export function AddAssetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const dispatch = useAppDispatch();

  const handleAddAsset = () => {
    if (ticker && shares && purchasePrice) {
      dispatch(addAsset({
        id: `asset-${Date.now()}`,
        ticker: ticker.toUpperCase(),
        shares: parseFloat(shares),
        purchasePrice: parseFloat(purchasePrice)
      }));
      setIsOpen(false);
      setTicker('');
      setShares('');
      setPurchasePrice('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2" /> Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Enter the details of the stock you want to add to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticker" className="text-right">
              Ticker
            </Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="col-span-3"
              placeholder="e.g. AAPL"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="shares" className="text-right">
              Shares
            </Label>
            <Input
              id="shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 10"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchase-price" className="text-right">
              Cost/Share
            </Label>
            <Input
              id="purchase-price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 150.75"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAsset}>Add Asset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
