'use client';

import { useEffect, useState } from 'react';
import { getNews } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import Image from 'next/image';

interface NewsArticle {
    headline: string;
    summary: string;
    source: string;
    url: string;
    imageUrl: string;
    publishedAt: string;
}

export function NewsClient() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const result = await getNews();
                if (result.error) {
                    setError(result.error);
                } else {
                    setNews(result.articles);
                }
            } catch (e) {
                setError('Failed to fetch news. Please try again later.');
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4 py-8">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-3/4" />
                <div className="space-y-6 pt-4">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-1/4 mt-2" />
                            </CardHeader>
                            <CardContent className="flex flex-col md:flex-row gap-4">
                                <Skeleton className="h-48 w-full md:w-1/3 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="py-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Financial News</h1>
                <p className="text-muted-foreground">Stay updated with the latest market-moving headlines.</p>
            </div>
            <div className="space-y-6">
                {news.map((article, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <CardTitle className="hover:underline">{article.headline}</CardTitle>
                            </a>
                            <CardDescription>
                                {article.source} - {new Date(article.publishedAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row gap-6">
                           <div className="w-full md:w-[300px] flex-shrink-0">
                             <Image
                                src={article.imageUrl}
                                alt={article.headline}
                                width={400}
                                height={225}
                                className="rounded-lg object-cover aspect-video w-full"
                                data-ai-hint="financial news"
                             />
                           </div>
                           <div className="flex-1">
                             <p className="text-sm text-muted-foreground">{article.summary}</p>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
