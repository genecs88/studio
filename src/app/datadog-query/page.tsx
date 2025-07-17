
"use client";

import { useState } from "react";
import { findIdentifiersByReportId } from "./actions";
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
import { AlertCircle, Search } from "lucide-react";

export default function DatadogQueryPage() {
    const [reportId, setReportId] = useState("");
    const [indexes, setIndexes] = useState("main");
    const [daysBack, setDaysBack] = useState(1);
    const [sort, setSort] = useState("timestamp");
    const [limit, setLimit] = useState(5);

    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedIdentifiers, setExtractedIdentifiers] = useState("");
    const [searchTimestamps, setSearchTimestamps] = useState<{ from: string; to: string } | null>(null);
    const [foundTraceId, setFoundTraceId] = useState<string | null>(null);

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);
        setExtractedIdentifiers("");
        setFoundTraceId(null);

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - daysBack);

        const to = toDate.toISOString();
        const from = fromDate.toISOString();

        setSearchTimestamps({ from, to });

        const constructedQuery = `Processing normal for report ${reportId}`;

        const payload = {
            filter: {
                query: constructedQuery,
                indexes: indexes.split(',').map(i => i.trim()).filter(Boolean),
                from,
                to,
            },
            sort,
            page: {
                limit: Number(limit),
            },
        };
        
        const result = await findIdentifiersByReportId(payload);
        
        setFoundTraceId(result.traceId || null);

        if (result.error) {
            setError(result.error + (result.details ? `: ${JSON.stringify(result.details, null, 2)}` : ''));
            setResponse(result.finalResponse || result.initialResponse || result.details || null);
        } else {
            setResponse(result.finalResponse);

            if (result.finalResponse?.data && Array.isArray(result.finalResponse.data)) {
                let identifiersObj = null;

                for (const event of result.finalResponse.data) {
                    const message = event.attributes?.message;
                    if (typeof message !== 'string') continue;

                    const keyword = "Identifiers:";
                    const keywordIndex = message.indexOf(keyword);

                    if (keywordIndex !== -1) {
                        try {
                            const jsonStr = message.substring(keywordIndex + keyword.length).trim();
                            const validJsonStr = jsonStr.replace(/'/g, '"');
                            identifiersObj = JSON.parse(validJsonStr);
                            break; 
                        } catch (e) {
                            console.error("Failed to parse Identifiers object:", e);
                            continue;
                        }
                    }
                }
                
                if (identifiersObj) {
                    setExtractedIdentifiers(JSON.stringify(identifiersObj, null, 2));
                } else {
                    setExtractedIdentifiers("");
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
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="reportId">Report ID</Label>
                        <Input id="reportId" value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="e.g., 146406" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="daysBack">Days To Search Back</Label>
                        <Input id="daysBack" type="number" value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4">
                    {searchTimestamps && (
                        <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded-md w-full">
                            <p><strong>From:</strong> {searchTimestamps.from}</p>
                            <p><strong>To:</strong> {searchTimestamps.to}</p>
                        </div>
                    )}
                    <Button onClick={handleSearch} disabled={isLoading || !reportId}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </Button>
                </CardFooter>
            </Card>
            
             {foundTraceId && (
                <Alert>
                    <Search className="h-4 w-4" />
                    <AlertTitle>Trace ID Found</AlertTitle>
                    <AlertDescription>
                        Found trace_id: <span className="font-mono bg-muted px-1 py-0.5 rounded">{foundTraceId}</span>. Now searching logs with this trace ID.
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>API Response</CardTitle>
                    <CardDescription>The final response from the Datadog API (using the trace_id) will appear here.</CardDescription>
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
                        <CardTitle>Extracted Report Payload</CardTitle>
                        <CardDescription>
                            Key-value pairs from the first log message containing "Identifiers:".
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            readOnly
                            value={extractedIdentifiers}
                            rows={10}
                            className="font-mono text-sm"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
