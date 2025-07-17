
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
import { AlertCircle, Search, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DatadogQueryPage() {
    const [reportId, setReportId] = useState("");
    const [env, setEnv] = useState("prod");
    const [daysBack, setDaysBack] = useState(1);
    
    const [response, setResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedIdentifiers, setExtractedIdentifiers] = useState("");
    const [extractedParentOrg, setExtractedParentOrg] = useState("");
    const [extractedOrgPath, setExtractedOrgPath] = useState("");
    const [searchTimestamps, setSearchTimestamps] = useState<{ from: string; to: string } | null>(null);
    const [foundTraceId, setFoundTraceId] = useState<string | null>(null);
    const [searchCompleted, setSearchCompleted] = useState(false);
    const { toast } = useToast();

    const handleCopyApiResponse = () => {
        if (!response) return;
        try {
            const jsonString = JSON.stringify(response, null, 2);
            navigator.clipboard.writeText(jsonString);
            toast({
                title: "Success",
                description: "API Response copied to clipboard.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not copy response to clipboard.",
            });
        }
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);
        setExtractedIdentifiers("");
        setExtractedParentOrg("");
        setExtractedOrgPath("");
        setFoundTraceId(null);
        setSearchCompleted(false);

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - daysBack);

        const to = toDate.toISOString();
        const from = fromDate.toISOString();

        setSearchTimestamps({ from, to });

        const constructedQuery = `env:${env} "Processing normal for report ${reportId}"`;

        const payload = {
            filter: {
                query: constructedQuery,
                indexes: ['main'],
                from,
                to,
            },
            sort: 'timestamp',
            page: {
                limit: 5,
            },
        };
        
        const result = await findIdentifiersByReportId(payload);
        
        setFoundTraceId(result.traceId || null);

        if (result.error) {
            setError(result.error + (result.details ? `: ${JSON.stringify(result.details, null, 2)}` : ''));
            setResponse(result.finalResponse || result.initialResponse || result.details || null);
        } else {
            setResponse(result.finalResponse);

            let identifiersFound = false;
            let parentOrgFound = false;
            let orgPathFound = false;

            if (result.finalResponse?.data && Array.isArray(result.finalResponse.data)) {
                // Extract Identifiers
                for (const event of result.finalResponse.data) {
                    const message = event.attributes?.message;
                    if (typeof message !== 'string') continue;

                    const keyword = "Identifiers:";
                    const keywordIndex = message.indexOf(keyword);

                    if (keywordIndex !== -1) {
                        try {
                            const jsonStr = message.substring(keywordIndex + keyword.length).trim();
                            const validJsonStr = jsonStr.replace(/'/g, '"');
                            const identifiersObj = JSON.parse(validJsonStr);
                            setExtractedIdentifiers(JSON.stringify(identifiersObj, null, 2));
                            identifiersFound = true;
                            break; 
                        } catch (e) {
                            console.error("Failed to parse Identifiers object:", e);
                            setError("Failed to parse Identifiers JSON from log message. See console for details.");
                        }
                    }
                }
                
                // Extract parent_org and org_path from the specific log entry
                for (const event of result.finalResponse.data) {
                    const attributes = event.attributes?.attributes;
                    if (attributes && attributes.parent_org) {
                        setExtractedParentOrg(attributes.parent_org);
                        parentOrgFound = true;

                        if (attributes.org_path) {
                            setExtractedOrgPath(JSON.stringify(attributes.org_path, null, 2));
                            orgPathFound = true;
                        }
                        break;
                    }
                }
            }

            if (!identifiersFound) {
                setExtractedIdentifiers("not found");
            }
            if (!parentOrgFound) {
                setExtractedParentOrg("not found");
            }
            if (!orgPathFound) {
                setExtractedOrgPath("not found");
            }
        }
        
        setIsLoading(false);
        setSearchCompleted(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Test Query to Datadog</h1>
                <p className="text-muted-foreground">Construct and send a POST request to the Datadog logs API.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Query Details</CardTitle>
                    <CardDescription>Enter the details for your Datadog query.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="reportId">Report ID</Label>
                        <Input id="reportId" value={reportId} onChange={(e) => setReportId(e.target.value)} placeholder="e.g., 146406" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="daysBack">Days To Search Back</Label>
                        <Input id="daysBack" type="number" value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="env">Environment</Label>
                        <Input id="env" value={env} onChange={(e) => setEnv(e.target.value)} />
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
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>API Response</CardTitle>
                        <CardDescription>The final response from the Datadog API (using the trace_id) will appear here.</CardDescription>
                    </div>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyApiResponse}
                        disabled={!response || isLoading}
                        aria-label="Copy API Response"
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
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
            
            {searchCompleted && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Extracted Parent Org</CardTitle>
                            <CardDescription>
                                The value of the "parent_org" key from the first log found in the trace.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                readOnly
                                value={extractedParentOrg}
                                rows={2}
                                className="font-mono text-sm"
                                placeholder={isLoading ? "Searching..." : "Parent org will appear here."}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Extracted Org Path</CardTitle>
                             <CardDescription>
                                The "org_path" value from the same log as the parent org.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                readOnly
                                value={extractedOrgPath}
                                rows={4}
                                className="font-mono text-sm"
                                placeholder={isLoading ? "Searching..." : "Org path will appear here."}
                            />
                        </CardContent>
                    </Card>

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
                                placeholder={isLoading ? "Searching..." : "Payload will appear here."}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

    