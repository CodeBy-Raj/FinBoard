
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAppSelector } from '@/lib/redux/hooks';
import { selectPortfolioAssets, PortfolioAsset } from '@/lib/redux/slices/portfolioSlice';
import { getRealTimeData } from '@/app/actions';
import { AddAssetDialog } from './add-asset-dialog';
import { PortfolioSummary } from './portfolio-summary';
import { AssetsTable } from './assets-table';

export interface PortfolioAssetWithData extends PortfolioAsset {
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

const chartConfig = {
    value: {
        label: "Value (USD)",
        color: "hsl(var(--chart-1))",
    },
};

export function PortfolioClient() {
    const assets = useAppSelector(selectPortfolioAssets);
    const [assetData, setAssetData] = useState<PortfolioAssetWithData[]>([]);
    const [loading, setLoading] = useState(true);

    const tickers = useMemo(() => assets.map(a => a.ticker), [assets]);

    const fetchData = useCallback(async () => {
        if (tickers.length === 0) {
            setAssetData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const result = await getRealTimeData(tickers);
        
        if (result && 'stockData' in result) {
            const enrichedData = assets.map(asset => {
                const stock = result.stockData.find(s => s.ticker === asset.ticker);
                const currentPrice = stock ? stock.price : asset.purchasePrice;
                const marketValue = asset.shares * currentPrice;
                const costBasis = asset.shares * asset.purchasePrice;
                const gainLoss = marketValue - costBasis;
                const gainLossPercent = costBasis === 0 ? 0 : (gainLoss / costBasis) * 100;
                
                return {
                    ...asset,
                    currentPrice,
                    marketValue,
                    gainLoss,
                    gainLossPercent
                };
            });
            setAssetData(enrichedData);
        }
        setLoading(false);
    }, [assets, tickers]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchData]);

    const { totalValue, totalGainLoss, totalGainLossPercent } = useMemo(() => {
        const totalValue = assetData.reduce((acc, item) => acc + item.marketValue, 0);
        const totalCostBasis = assets.reduce((acc, item) => acc + (item.shares * item.purchasePrice), 0);
        const totalGainLoss = totalValue - totalCostBasis;
        const totalGainLossPercent = totalCostBasis === 0 ? 0 : (totalGainLoss / totalCostBasis) * 100;
        
        return { totalValue, totalGainLoss, totalGainLossPercent };
    }, [assetData, assets]);
    
    const allocationData = useMemo(() => {
        return assetData.map(asset => ({
            name: asset.ticker,
            value: asset.marketValue
        })).sort((a,b) => b.value - a.value);
    }, [assetData]);

    return (
        <div className="space-y-8 py-8">
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold font-headline">My Portfolio</h1>
                    <p className="text-muted-foreground">An overview of your investment assets.</p>
                </div>
                <AddAssetDialog />
            </div>

            <PortfolioSummary 
                totalValue={totalValue}
                totalGainLoss={totalGainLoss}
                totalGainLossPercent={totalGainLossPercent}
                loading={loading && assets.length > 0}
            />

            <Card>
                <CardHeader>
                    <CardTitle>My Holdings</CardTitle>
                    <CardDescription>A detailed breakdown of your current assets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AssetsTable assets={assetData} loading={loading && assets.length > 0} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>Distribution of your assets by market value.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={allocationData} layout="vertical">
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                             <XAxis
                                type="number"
                                dataKey="value"
                                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="value" name="Market Value" radius={4} fill="var(--color-value)" />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
