'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const portfolioData = [
    { asset: "AAPL", value: 45000, type: "stocks" },
    { asset: "MSFT", value: 32000, type: "stocks" },
    { asset: "GOOGL", value: 28000, type: "stocks" },
    { asset: "BTC", value: 25000, type: "crypto" },
    { asset: "ETH", value: 18000, type: "crypto" },
    { asset: "USDT", value: 15000, type: "crypto" },
    { asset: "Real Estate", value: 120000, type: "real_estate" },
    { asset: "Bonds", value: 50000, type: "fixed_income" },
];

const chartConfig = {
    value: {
        label: "Value (USD)",
    },
    stocks: {
        label: "Stocks",
        color: "hsl(var(--chart-1))",
    },
    crypto: {
        label: "Crypto",
        color: "hsl(var(--chart-2))",
    },
    real_estate: {
        label: "Real Estate",
        color: "hsl(var(--chart-3))",
    },
    fixed_income: {
        label: "Fixed Income",
        color: "hsl(var(--chart-4))",
    },
};

export function PortfolioClient() {
    const totalValue = portfolioData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="space-y-8 py-8">
             <div>
                <h1 className="text-4xl font-bold font-headline">My Portfolio</h1>
                <p className="text-muted-foreground">An overview of your investment assets.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Total Portfolio Value</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">${totalValue.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Asset Allocation</CardTitle>
                    <CardDescription>Distribution of your assets across different classes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart accessibilityLayer data={portfolioData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="asset"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                             <YAxis
                                tickFormatter={(value) => `$${Number(value) / 1000}k`}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="value" name="Value" radius={4}>
                                {portfolioData.map((entry) => (
                                    <Bar
                                        key={entry.asset}
                                        dataKey="value"
                                        fill={chartConfig[entry.type as keyof typeof chartConfig]?.color || "#8884d8"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
