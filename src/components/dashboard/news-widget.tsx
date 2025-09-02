import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const newsItems = [
  {
    headline: "Tech Stocks Rally as Inflation Fears Subside",
    source: "Bloomberg",
    time: "2h ago",
  },
  {
    headline: "Federal Reserve Signals Potential Rate Cuts Later This Year",
    source: "Reuters",
    time: "4h ago",
  },
  {
    headline: "New Innovations in AI Chip Manufacturing Boost NVDA Outlook",
    source: "The Wall Street Journal",
    time: "5h ago",
  },
  {
    headline: "Global Supply Chain Issues Easing, Benefiting Retail Sector",
    source: "Financial Times",
    time: "8h ago",
  },
  {
    headline: "Market Analysis: Is the Bull Run for Energy Stocks Over?",
    source: "MarketWatch",
    time: "10h ago",
  },
];

export function NewsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Latest News</CardTitle>
        <CardDescription>Top financial news from around the world.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems.map((item, index) => (
            <div key={index}>
              <div>
                <a href="#" className="font-semibold leading-snug hover:underline">{item.headline}</a>
                <div className="text-xs text-muted-foreground mt-1">
                  <span>{item.source}</span> &middot; <span>{item.time}</span>
                </div>
              </div>
              {index < newsItems.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
