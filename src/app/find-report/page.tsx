
"use client";

import { useState, useMemo } from "react";
import { useAppData } from "@/context/app-data-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function FindReportPage() {
  const { environments, organizations, apiKeys, orgPaths, apiActions } = useAppData();

  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedOrgPath, setSelectedOrgPath] = useState("");
  const [accessionNumber, setAccessionNumber] = useState("");
  const [jsonPayload, setJsonPayload] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [postUrl, setPostUrl] = useState("");

  const filteredOrganizations = useMemo(() => {
    if (!selectedEnvironment) return [];
    return organizations.filter(
      (org) => org.environmentId === selectedEnvironment
    );
  }, [selectedEnvironment, organizations]);

  const filteredOrgPaths = useMemo(() => {
    if (!selectedOrganization) return [];
    return orgPaths.filter((path) => path.organizationId === selectedOrganization);
  }, [selectedOrganization, orgPaths]);

  const selectedOrgDetails = useMemo(() => {
    return organizations.find((org) => org.id === selectedOrganization);
  }, [selectedOrganization, organizations]);

  const handleEnvironmentChange = (value: string) => {
    setSelectedEnvironment(value);
    setSelectedOrganization("");
    setSelectedOrgPath("");
  };

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    setSelectedOrgPath("");
  };
  
  const handleReset = () => {
    setSelectedEnvironment("");
    setSelectedOrganization("");
    setSelectedOrgPath("");
    setAccessionNumber("");
    setJsonPayload("");
    setResponse("");
    setIsLoading(false);
    setPostUrl("");
  };

  const handleCreateJson = () => {
    if (!selectedOrganization) {
      alert("Please select an organization first.");
      return;
    }

    const payload: { [key: string]: any } = {};

    payload.accession_number = accessionNumber;

    if (selectedOrgDetails && selectedOrgDetails.studyIdentifiers) {
      for (const identifier of selectedOrgDetails.studyIdentifiers) {
        payload[identifier.value] = "";
      }
    }

    if (selectedOrgPath) {
      const orgPathData = orgPaths.find((p) => p.id === selectedOrgPath);
      if (orgPathData) {
        payload.org_path = orgPathData.path.split(",");
      }
    }

    setJsonPayload(JSON.stringify(payload, null, 2));
  };
  
  const handleFind = async () => {
    setIsLoading(true);
    setResponse("");
    setPostUrl("");

    const env = environments.find(e => e.id === selectedEnvironment);
    const findAction = apiActions.find(a => a.environmentId === selectedEnvironment && a.key === 'FIND');
    const org = organizations.find(o => o.id === selectedOrganization);
    
    if(!env || !findAction || !org) {
        setResponse("Error: Could not construct URL. Missing environment, action, or organization details.");
        setIsLoading(false);
        return;
    }

    const constructedPostUrl = `${env.url}${findAction.value}`;
    setPostUrl(constructedPostUrl);
    
    const apiKeyData = apiKeys.find(k => {
        const keyOrg = organizations.find(o => o.name === k.organization && o.environmentId === env.id);
        return keyOrg?.id === selectedOrganization;
    });

    if (!apiKeyData) {
        setResponse("Error: API Key for the selected organization and environment not found.");
        setIsLoading(false);
        return;
    }

    try {
        const res = await fetch(constructedPostUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKeyData.key}`
            },
            body: jsonPayload,
        });

        const responseData = await res.json();
        setResponse(JSON.stringify(responseData, null, 2));

    } catch (error: any) {
        setResponse(`Error: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Find Report
        </h1>
        <p className="text-muted-foreground">
          Construct and send a POST request to find a report.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Configuration</CardTitle>
          <CardDescription>
            Select the parameters to build your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="environment">Environment</Label>
                    <Select value={selectedEnvironment} onValueChange={handleEnvironmentChange}>
                    <SelectTrigger id="environment">
                        <SelectValue placeholder="Select Environment" />
                    </SelectTrigger>
                    <SelectContent>
                        {environments.map((env) => (
                        <SelectItem key={env.id} value={env.id}>
                            {env.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Select value={selectedOrganization} onValueChange={handleOrganizationChange} disabled={!selectedEnvironment}>
                    <SelectTrigger id="organization">
                        <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                            {org.name}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="org-path">Org Path (Optional)</Label>
                    <Select value={selectedOrgPath} onValueChange={setSelectedOrgPath} disabled={!selectedOrganization}>
                    <SelectTrigger id="org-path">
                        <SelectValue placeholder="Select Org Path" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredOrgPaths.map((path) => (
                        <SelectItem key={path.id} value={path.id}>
                            {path.path}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
            </div>
          
            <Separator />

            <div className="grid gap-4">
                <h3 className="text-lg font-medium">Payload Details</h3>
                <div className="grid gap-2">
                    <Label htmlFor="accession_number">Accession Number</Label>
                    <Input
                        id="accession_number"
                        value={accessionNumber}
                        onChange={(e) => setAccessionNumber(e.target.value)}
                    />
                </div>
            </div>
            
        </CardContent>
        <CardFooter className="justify-start gap-2">
            <Button onClick={handleCreateJson} disabled={!selectedOrganization}>Create JSON</Button>
            <Button onClick={handleReset} variant="outline">Reset</Button>
        </CardFooter>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>JSON Payload</CardTitle>
                <CardDescription>Generated JSON, you can edit it before sending.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={jsonPayload}
                    onChange={(e) => setJsonPayload(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                />
            </CardContent>
        </Card>
        <Card>
             <CardHeader>
                <CardTitle>API Response</CardTitle>
                <CardDescription>The response from the POST request will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={isLoading ? "Loading..." : response}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                />
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid gap-2">
                <Label htmlFor="post-url">POST URL</Label>
                <Input id="post-url" readOnly value={postUrl} className="font-mono" />
            </div>
        </CardContent>
      </Card>

      <div className="mt-2">
        <Button onClick={handleFind} disabled={isLoading || !jsonPayload} size="lg">
            {isLoading ? 'Finding...' : 'FIND'}
        </Button>
      </div>

    </div>
  );
}
