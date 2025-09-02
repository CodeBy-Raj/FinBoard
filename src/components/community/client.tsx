'use client';
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, MessageSquare } from "lucide-react";

const communityPosts = [
    {
        id: 1,
        author: { name: "Trader Joe", avatar: "https://picsum.photos/id/1011/40/40" },
        time: "2h ago",
        content: "Bullish on $NVDA long term. Their AI chip dominance is just getting started. What are your thoughts?",
        likes: 125,
        comments: 42,
    },
    {
        id: 2,
        author: { name: "Crypto King", avatar: "https://picsum.photos/id/1025/40/40" },
        time: "5h ago",
        content: "Is this the bottom for Bitcoin? The halving is approaching, historically a major catalyst for price increase. I'm accumulating.",
        likes: 312,
        comments: 156,
    },
    {
        id: 3,
        author: { name: "Value Investor", avatar: "https://picsum.photos/id/1005/40/40" },
        time: "1d ago",
        content: "The market seems overvalued right now. I'm holding cash and looking for bargains in consumer staples. Boring but safe.",
        likes: 88,
        comments: 19,
    },
];

export function CommunityClient() {
    const [posts, setPosts] = useState(communityPosts);
    const [newPost, setNewPost] = useState("");

    const handlePost = () => {
        if (newPost.trim()) {
            const post = {
                id: posts.length + 1,
                author: { name: "You", avatar: "https://picsum.photos/32/32" },
                time: "Just now",
                content: newPost,
                likes: 0,
                comments: 0,
            };
            setPosts([post, ...posts]);
            setNewPost("");
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline">Community Forum</h1>
                <p className="text-muted-foreground">Discuss market trends with fellow investors.</p>
            </div>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Create a Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="What's on your mind?" 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                    />
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePost}>Post</Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                {posts.map(post => (
                    <Card key={post.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar>
                                <AvatarImage src={post.author.avatar} alt={post.author.name} data-ai-hint="person avatar"/>
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{post.author.name}</p>
                                <p className="text-sm text-muted-foreground">{post.time}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p>{post.content}</p>
                        </CardContent>
                        <CardFooter className="flex gap-4">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4" /> {post.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> {post.comments}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
