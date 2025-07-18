
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppData } from "@/context/app-data-context";
import { findIdentifiersByReportId } from "@/app/datadog-query/actions";
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
import { AlertCircle, Search, Building } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function TransferOwnershipV2Page() {
    const { environments, organizations, apiKeys, apiActions } = useAppData();

    // Datadog query state
    const [reportId, setReportId] = useState("");
    const [env, setEnv] = useState("prod");
    const [daysBack, setDaysBack] = useState(1);
    const [isDatadogLoading, setIsDatadogLoading] = useState(false);
    const [datadogError, setDatadogError] = useState<string | null>(null);
    const [extractedIdentifiers, setExtractedIdentifiers] = useState<any | null>(null);
    const [extractedParentOrg, setExtractedParentOrg] = useState("");
    const [foundTraceId, setFoundTraceId] = useState<string | null>(null);
    const [searchCompleted, setSearchCompleted] = useState(false);
    
    // Transfer Ownership state
    const [newOwnerEmail, setNewOwnerEmail] = useState("");
    const [forceChecked, setForceChecked] = useState(false);
    const [jsonPayload, setJsonPayload] = useState("");
    const [transferResponse, setTransferResponse] = useState<any>(null);
    const [isTransferLoading, setIsTransferLoading] = useState(false);
    const [constructedPostUrl, setConstructedPostUrl] = useState("");
    
    const { toast } = useToast();

    // Automatically update the JSON payload when identifiers or other fields change
    useEffect(() => {
        if (extractedIdentifiers) {
            const payload = { 
                ...extractedIdentifiers,
                email: newOwnerEmail,
                force: forceChecked,
            };
            setJsonPayload(JSON.stringify(payload, null, 2));
        }
    }, [extractedIdentifiers, newOwnerEmail, forceChecked]);

    const handleClear = () => {
        setReportId("");
        setEnv("prod");
        setDaysBack(1);
        setIsDatadogLoading(false);
        setDatadogError(null);
        setExtractedIdentifiers(null);
        setExtractedParentOrg("");
        setFoundTraceId(null);
        setSearchCompleted(false);
        
        setNewOwnerEmail("");
        setForceChecked(false);
        setJsonPayload("");
        setTransferResponse(null);
        setIsTransferLoading(false);
        setConstructedPostUrl("");

        toast({
            title: "Cleared",
            description: "All fields have been reset.",
        });
    };

    const handleDatadogSearch = async () => {
        setIsDatadogLoading(true);
        setDatadogError(null);
        setExtractedIdentifiers(null);
        setExtractedParentOrg("");
        setFoundTraceId(null);
        setSearchCompleted(false);
        setJsonPayload("");
        setTransferResponse(null);

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(toDate.getDate() - daysBack);

        const to = toDate.toISOString();
        const from = fromDate.toISOString();

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
            setDatadogError(result.error + (result.details ? `: ${JSON.stringify(result.details, null, 2)}` : ''));
        } else {
            let identifiersFound = false;
            let identifiersObj: any = null;
            let orgPathValue: string[] | null = null;
            let parentOrgValue: string | null = null;

            if (result.finalResponse?.data && Array.isArray(result.finalResponse.data)) {
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
                            identifiersFound = true;
                            break; 
                        } catch (e) {
                            console.error("Failed to parse Identifiers object:", e);
                            setDatadogError("Failed to parse Identifiers JSON from log message. See console for details.");
                        }
                    }
                }
                
                for (const event of result.finalResponse.data) {
                    const attributes = event.attributes?.attributes;
                    if (attributes && attributes.parent_org) {
                        parentOrgValue = attributes.parent_org;
                        if (attributes.org_path) {
                            orgPathValue = attributes.org_path;
                        }
                        break;
                    }
                }

                if (identifiersObj && orgPathValue) {
                   identifiersObj.org_path = orgPathValue;
                }
                
                if (identifiersObj) {
                    setExtractedIdentifiers(identifiersObj);
                } else {
                    setExtractedIdentifiers(null);
                }
            }

            setExtractedParentOrg(parentOrgValue || "not found");

            if (!identifiersFound) {
                setExtractedIdentifiers(null);
                setDatadogError("Could not find 'Identifiers:' log entry in the trace.");
            }
        }
        
        setIsDatadogLoading(false);
        setSearchCompleted(true);
    };

    const handleTransfer = async () => {
        setIsTransferLoading(true);
        setTransferResponse(null);
        setConstructedPostUrl("");

        const environment = environments.find(e => e.name.toLowerCase() === env.toLowerCase());

        if (!environment) {
            setTransferResponse(`Error: Environment configuration for '${env}' not found.`);
            setIsTransferLoading(false);
            return;
        }

        const transferAction = apiActions.find(a => a.key === 'transfer ownership');
        if (!transferAction) {
            setTransferResponse("Error: 'transfer ownership' API action not configured.");
            setIsTransferLoading(false);
            return;
        }

        let parsedPayload;
        try {
            parsedPayload = JSON.parse(jsonPayload);
        } catch (e) {
            setTransferResponse("Error: JSON Payload is not valid JSON.");
            setIsTransferLoading(false);
            return;
        }

        const organization = organizations.find(o => o.name.toLowerCase() === extractedParentOrg.toLowerCase() && o.environmentId === environment.id);

        if (!organization) {
            setTransferResponse(`Error: Organization '${extractedParentOrg}' not found in environment '${environment.name}'.`);
            setIsTransferLoading(false);
            return;
        }
        
        const apiKeyData = apiKeys.find(k => k.organizationId === organization.id && k.environmentId === environment.id);
        if (!apiKeyData) {
            setTransferResponse(`Error: API Key for organization '${organization.name}' in environment '${environment.name}' not found.`);
            setIsTransferLoading(false);
            return;
        }

        const urlToFetch = `${environment.url}${transferAction.value}`;
        setConstructedPostUrl(urlToFetch);

        try {
            const res = await fetch(urlToFetch, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKeyData.key}`
                },
                body: jsonPayload,
            });

            const responseText = await res.text();
            try {
                setTransferResponse(JSON.parse(responseText));
            } catch (e) {
                setTransferResponse(responseText);
            }
        } catch (error: any) {
            setTransferResponse(`Error: ${error.message}`);
        } finally {
            setIsTransferLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Transfer Ownership V2
                </h1>
                <p className="text-muted-foreground">Search Datadog to get a report payload, then use it to transfer ownership.</p>
            </div>

            {/* Step 1: Datadog Query */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Query Datadog</CardTitle>
                    <CardDescription>Enter a Report ID to find its trace and extract the payload.</CardDescription>
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
                    <div className="flex gap-2">
                        <Button onClick={handleDatadogSearch} disabled={isDatadogLoading || !reportId}>
                            {isDatadogLoading ? 'Searching Datadog...' : 'Search Datadog'}
                        </Button>
                         <Button onClick={handleClear} variant="outline">
                            Clear
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            {/* Datadog Results */}
            {searchCompleted && (
                 <div className="flex flex-col gap-4">
                    {datadogError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Datadog Search Failed</AlertTitle>
                            <AlertDescription className="break-words">{datadogError}</AlertDescription>
                        </Alert>
                    )}
                    {foundTraceId && (
                        <Alert>
                            <Search className="h-4 w-4" />
                            <AlertTitle>Trace ID Found</AlertTitle>
                            <AlertDescription>
                                Found trace_id: <span className="font-mono bg-muted px-1 py-0.5 rounded">{foundTraceId}</span>.
                            </AlertDescription>
                        </Alert>
                    )}
                    {extractedParentOrg && extractedParentOrg !== 'not found' && (
                        <Alert>
                            <Building className="h-4 w-4" />
                            <AlertTitle>Parent Org Found</AlertTitle>
                            <AlertDescription>
                                Found parent_org: <span className="font-mono bg-muted px-1 py-0.5 rounded">{extractedParentOrg}</span>.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}
            
            {/* Step 2: Transfer Ownership */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 2: Transfer Details</CardTitle>
                    <CardDescription>Enter the new owner's email and confirm the payload.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-owner-email">New Owner Email</Label>
                            <Input 
                                id="new-owner-email" 
                                type="email" 
                                value={newOwnerEmail} 
                                onChange={(e) => setNewOwnerEmail(e.target.value)} 
                                placeholder="new.owner@example.com"
                                disabled={!extractedIdentifiers}
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="force" 
                                    checked={forceChecked} 
                                    onCheckedChange={(checked) => setForceChecked(checked === true)}
                                    disabled={!extractedIdentifiers}
                                />
                                <Label htmlFor="force" className="font-normal cursor-pointer">
                                    Force Transfer
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-4 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>JSON Payload</CardTitle>
                        <CardDescription>This payload will be sent to the transfer endpoint.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={jsonPayload}
                            onChange={(e) => setJsonPayload(e.target.value)}
                            rows={15}
                            className="font-mono text-sm"
                            disabled={!extractedIdentifiers}
                        />
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>API Response (from Transfer)</CardTitle>
                        <CardDescription>The response from the Transfer POST request will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isTransferLoading ? (
                            <div className="flex items-center justify-center h-[318px] text-muted-foreground">
                                <p>Loading...</p>
                            </div>
                        ) : transferResponse ? (
                            typeof transferResponse === 'string' ? (
                                <Textarea
                                    value={transferResponse}
                                    readOnly
                                    rows={15}
                                    className="font-mono text-sm"
                                />
                            ) : (
                                <div className="p-2 rounded-md bg-secondary text-secondary-foreground overflow-auto max-h-[318px] text-sm font-mono">
                                    <JsonViewer 
                                        value={transferResponse} 
                                        theme="dark"
                                        style={{ backgroundColor: 'transparent' }}
                                    />
                                </div>
                            )
                        ) : (
                            <Textarea
                                value=""
                                readOnly
                                rows={15}
                                placeholder="Transfer API response will be shown here."
                                className="font-mono text-sm"
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-2">
                <Button onClick={handleTransfer} disabled={isTransferLoading || !jsonPayload || !newOwnerEmail} size="lg">
                    {isTransferLoading ? 'Transferring...' : 'Transfer Ownership'}
                </Button>
            </div>
            
            {constructedPostUrl && (
                <div className="w-full p-2 mt-4 rounded-md bg-muted">
                    <p className="text-sm font-mono text-muted-foreground break-all">
                        POST to: {constructedPostUrl}
                    </p>
                </div>
            )}
        </div>
    );
}
