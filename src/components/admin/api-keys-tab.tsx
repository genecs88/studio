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
import { apiKeys as initialApiKeys, type ApiKey } from "@/lib/placeholder-data";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddApiKeyDialog from "./generate-api-key-dialog";
import EditApiKeyDialog from "./edit-api-key-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function ApiKeyRow({ apiKey, onDelete }: { apiKey: ApiKey; onDelete: (id: string) => void; }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    
    const handleDelete = () => {
        onDelete(apiKey.id);
        setDeleteDialogOpen(false);
    }

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
                    variant="secondary"
                >
                    {apiKey.environment}
                </Badge>
            </TableCell>
            <TableCell>{apiKey.createdAt}</TableCell>
            <TableCell>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteDialogOpen(true)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <EditApiKeyDialog apiKey={apiKey} onOpenChange={setEditDialogOpen} />
                    </Dialog>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the API key for "{apiKey.organization}".
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    )
}


export default function ApiKeysTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  
  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  }

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                        Manage API keys for different environments.
                    </CardDescription>
                </div>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Add API Key
                      </span>
                  </Button>
                </DialogTrigger>
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
                        <ApiKeyRow key={key.id} apiKey={key} onDelete={handleDeleteKey} />
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
        <AddApiKeyDialog />
      </Dialog>
    </>
  );
}
