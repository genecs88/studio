
"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

export default function DatadogQueryPage() {
    const [query, setQuery] = useState("datadog-agent");
    const [indexes, setIndexes] = useState("main");
    const [daysBack, setDaysBack] = useState(1);
    const [sort, setSort] = useState("timestamp");
    const [limit, setLimit] = useState(5);

    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedIdentifiers, setExtractedIdentifiers] = useState("");
    const [searchTimestamps, setSearchTimestamps] = useState<{ from: string; to: string } | null>(null);

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);
        setExtractedIdentifiers("");

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - daysBack);

        const to = toDate.toISOString();
        const from = fromDate.toISOString();

        setSearchTimestamps({ from, to });

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

            if (result.data?.data && Array.isArray(result.data.data)) {
                for (const event of result.data.data) {
                     if (event.attributes?.message && typeof event.attributes.message === 'string') {
                        const message = event.attributes.message;
                        const startIndex = message.indexOf('{');
                        const endIndex = message.lastIndexOf('}');
                        
                        if (startIndex !== -1 && endIndex > startIndex) {
                            // Extract the object-like string e.g. {'key': 'value'}
                            let objectString = message.substring(startIndex, endIndex + 1);
                            
                            // Convert Python-style dict string to valid JSON string
                            // by replacing single quotes with double quotes.
                            const jsonString = objectString.replace(/'/g, '"');

                            try {
                                const identifiersObject = JSON.parse(jsonString);
                                const identifiersText = Object.entries(identifiersObject)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join('\n');

                                if (identifiersText) {
                                    setExtractedIdentifiers(identifiersText);
                                    break; // Found the first one, so we can stop.
                                }
                            } catch (e) {
                                // This substring was not valid JSON, or something else went wrong.
                                // Silently continue to the next log event.
                            }
                        }
                    }
                }
            }
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
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 lg:col-span-3">
                        <Label htmlFor="query">Filter Query</Label>
                        <Input id="query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., service:my-app" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="indexes">Indexes</Label>
                        <Input id="indexes" value={indexes} onChange={(e) => setIndexes(e.target.value)} placeholder="e.g., main, web" />
                        <p className="text-xs text-muted-foreground">Comma-separated list of indexes.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="daysBack">Days To Search Back</Label>
                        <Input id="daysBack" type="number" value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} />
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
                <CardFooter className="flex-col items-start gap-4">
                    {searchTimestamps && (
                        <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded-md w-full">
                            <p><strong>From:</strong> {searchTimestamps.from}</p>
                            <p><strong>To:</strong> {searchTimestamps.to}</p>
                        </div>
                    )}
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

            {extractedIdentifiers && (
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Identifiers</CardTitle>
                        <CardDescription>
                            Key-value pairs from the object found in the first relevant log event.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            readOnly
                            value={extractedIdentifiers}
                            rows={8}
                            className="font-mono text-sm"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
