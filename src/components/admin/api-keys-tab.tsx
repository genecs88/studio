"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, PlusCircle, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { apiKeys, type ApiKey } from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function ApiKeyRow({ apiKey }: { apiKey: ApiKey }) {
    const [isVisible, setIsVisible] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(apiKey.key);
            toast({
                title: "Copied to clipboard!",
                description: "The API key has been copied to your clipboard.",
            });
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Input 
                        type={isVisible ? "text" : "password"} 
                        readOnly 
                        value={apiKey.key} 
                        className="font-mono bg-transparent border-0 ring-offset-0 focus-visible:ring-0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => setIsVisible(!isVisible)} className="shrink-0">
                        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{isVisible ? "Hide key" : "Show key"}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="shrink-0">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy key</span>
                    </Button>
                </div>
            </TableCell>
            <TableCell>{apiKey.organization}</TableCell>
            <TableCell>
                <Badge 
                    variant={
                        apiKey.environment === "Production" ? "destructive" :
                        apiKey.environment === "Staging" ? "secondary" :
                        "default"
                    }
                    className={
                        apiKey.environment === "Production" ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" :
                        apiKey.environment === "Staging" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20" :
                        "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                    }
                >
                    {apiKey.environment}
                </Badge>
            </TableCell>
            <TableCell>{apiKey.createdAt}</TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem className="text-destructive">Revoke</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}


export default function ApiKeysTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                    Manage and generate API keys for different environments.
                </CardDescription>
            </div>
            <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Generate Key
                </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[450px]">Key</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {apiKeys.map((key) => (
                    <ApiKeyRow key={key.id} apiKey={key} />
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
