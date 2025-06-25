
"use client";

import { useState, useEffect } from "react";
import { queryDatadog } from "./actions";
import { JsonViewer } from "@textea/json-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DatadogQueryPage() {
    const [query, setQuery] = useState("datadog-agent");
    const [indexes, setIndexes] = useState("main");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [sort, setSort] = useState("timestamp");
    const [limit, setLimit] = useState(5);

    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set initial date range on client-side to avoid hydration mismatch
    useEffect(() => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        setTo(now.toISOString());
        setFrom(oneHourAgo.toISOString());
    }, []);

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);

        const payload = {
            filter: {
                query,
                indexes: indexes.split(',').map(i => i.trim()).filter(Boolean),
                from,
                to,
            },
            sort,
            page: {
                limit: Number(limit),
            },
        };
        
        const result = await queryDatadog(payload);

        if (result.error) {
            setError(result.error + (result.details ? `: ${JSON.stringify(result.details, null, 2)}` : ''));
            setResponse(result.details || null);
        } else {
            setResponse(result.data);
        }
        
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Test Query to Datadog</h1>
                <p className="text-muted-foreground">Construct and send a POST request to the Datadog logs API.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Query Payload</CardTitle>
                    <CardDescription>Enter the details for your Datadog query.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="query">Filter Query</Label>
                        <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., service:my-app" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="indexes">Indexes</Label>
                        <Input id="indexes" value={indexes} onChange={(e) => setIndexes(e.target.value)} placeholder="e.g., main, web" />
                        <p className="text-xs text-muted-foreground">Comma-separated list of indexes.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="from">From Timestamp</Label>
                        <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="ISO 8601 format" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="to">To Timestamp</Label>
                        <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="ISO 8601 format" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort">Sort</Label>
                        <Input id="sort" value={sort} onChange={(e) => setSort(e.target.value)} placeholder="e.g., timestamp" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="limit">Page Limit</Label>
                        <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Response</CardTitle>
                    <CardDescription>The response from the Datadog API will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                     {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Request Failed</AlertTitle>
                            <AlertDescription className="break-words">{error}</AlertDescription>
                        </Alert>
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">
                            <p>Loading...</p>
                        </div>
                    ) : response ? (
                        <div className="p-2 rounded-md bg-secondary text-secondary-foreground overflow-auto max-h-[400px] text-sm font-mono">
                            <JsonViewer 
                                value={response} 
                                theme="dark"
                                style={{ backgroundColor: 'transparent' }}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-md text-muted-foreground">
                            <p>API response will be shown here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="w-full p-2 mt-2 rounded-md bg-muted">
                <p className="text-sm font-mono text-muted-foreground break-all">
                    POST https://api.datadoghq.com/api/v2/logs/events/search
                </p>
            </div>
        </div>
    );
}
