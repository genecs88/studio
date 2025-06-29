
"use client";

import { useState, useMemo } from "react";
import { useAppData } from "@/context/app-data-context";
import { JsonViewer } from "@textea/json-viewer"
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";


export default function UpdateReportPage() {
  const { environments, organizations, apiKeys, orgPaths, apiActions } = useAppData();

  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [selectedOrgPath, setSelectedOrgPath] = useState("");
  const [accessionNumber, setAccessionNumber] = useState("");
  const [status, setStatus] = useState("");
  const [jsonPayload, setJsonPayload] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [constructedPostUrl, setConstructedPostUrl] = useState("");

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
    setConstructedPostUrl("");
  };

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    setSelectedOrgPath("");
    setConstructedPostUrl("");
  };
  
  const handleReset = () => {
    setSelectedEnvironment("");
    setSelectedOrganization("");
    setSelectedOrgPath("");
    setAccessionNumber("");
    setStatus("");
    setJsonPayload("");
    setResponse(null);
    setIsLoading(false);
    setConstructedPostUrl("");
  };

  const handleCreateJson = () => {
    if (!selectedOrganization) {
      alert("Please select an organization first.");
      return;
    }
    if (!status) {
      alert("Please select a status first.");
      return;
    }

    const payload: { [key: string]: any } = {};

    payload.status = status;
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

    const env = environments.find(e => e.id === selectedEnvironment);
    const updateAction = apiActions.find(a => a.key === 'UPDATE');
    
    if (env && updateAction) {
        setConstructedPostUrl(`${env.url}${updateAction.value}`);
    } else {
        setConstructedPostUrl("");
    }
  };
  
  const handleUpdateReport = async () => {
    setIsLoading(true);
    setResponse(null);

    const env = environments.find(e => e.id === selectedEnvironment);
    const updateAction = apiActions.find(a => a.key === 'UPDATE');
    const org = organizations.find(o => o.id === selectedOrganization);
    
    if(!env || !updateAction || !org) {
        setResponse("Error: Could not construct URL. Missing environment, action, or organization details.");
        setIsLoading(false);
        return;
    }

    const urlToFetch = `${env.url}${updateAction.value}`;
    
    const apiKeyData = apiKeys.find(k => k.organizationId === selectedOrganization && k.environmentId === selectedEnvironment);

    if (!apiKeyData) {
        setResponse("Error: API Key for the selected organization and environment not found.");
        setIsLoading(false);
        return;
    }

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
            const responseData = JSON.parse(responseText);
            setResponse(responseData);
        } catch (e) {
            setResponse(responseText);
        }

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
          Update Report Status
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
            <div>
                <Label className="font-semibold">Environment</Label>
                <RadioGroup
                    value={selectedEnvironment}
                    onValueChange={handleEnvironmentChange}
                    className="flex flex-wrap gap-x-6 gap-y-2 mt-2"
                >
                    {environments.map((env) => (
                        <div key={env.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={env.id} id={`update-env-${env.id}`} />
                            <Label htmlFor={`update-env-${env.id}`} className="font-normal cursor-pointer">
                                {env.name}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
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

                <Input
                    id="accession_number"
                    placeholder="Accession Number"
                    value={accessionNumber}
                    onChange={(e) => setAccessionNumber(e.target.value)}
                    disabled={!selectedOrganization}
                />
            </div>
            <div className="pt-2">
                <Label className="font-semibold">Status</Label>
                <RadioGroup
                    value={status}
                    onValueChange={setStatus}
                    className="flex flex-wrap gap-x-6 gap-y-2 mt-2"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="draft" id="status-draft" disabled={!selectedOrganization} />
                        <Label htmlFor="status-draft" className="font-normal cursor-pointer">
                            draft
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cancelled" id="status-cancelled" disabled={!selectedOrganization} />
                        <Label htmlFor="status-cancelled" className="font-normal cursor-pointer">
                            cancelled
                        </Label>
                    </div>
                </RadioGroup>
            </div>
        </CardContent>
        <CardFooter>
            <div className="flex gap-2">
                <Button onClick={handleCreateJson} disabled={!selectedOrganization}>Create JSON</Button>
                <Button onClick={handleReset} variant="outline">Reset</Button>
            </div>
        </CardFooter>
      </Card>
      
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
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
        <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle>API Response</CardTitle>
                <CardDescription>The response from the POST request will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                        <p>Loading...</p>
                    </div>
                ) : response ? (
                    typeof response === 'string' ? (
                        <Textarea
                            value={response}
                            readOnly
                            rows={12}
                            className="font-mono text-sm"
                        />
                    ) : (
                        <div className="p-2 rounded-md bg-secondary text-secondary-foreground overflow-auto max-h-[260px] text-sm font-mono">
                            <JsonViewer 
                                value={response} 
                                theme="dark"
                                style={{ backgroundColor: 'transparent' }}
                            />
                        </div>
                    )
                ) : (
                    <Textarea
                        value=""
                        readOnly
                        rows={12}
                        placeholder="API response will be shown here."
                        className="font-mono text-sm"
                    />
                )}
            </CardContent>
        </Card>
      </div>

      <div className="mt-2">
        <Button onClick={handleUpdateReport} disabled={isLoading || !jsonPayload} size="lg">
            {isLoading ? 'Updating...' : 'Update Report Status'}
        </Button>
      </div>
      
      {constructedPostUrl && (
        <div className="w-full p-2 mt-4 rounded-md bg-muted">
            <p className="text-sm font-mono text-muted-foreground break-all">
                {constructedPostUrl}
            </p>
        </div>
      )}
    </div>
  );
}
