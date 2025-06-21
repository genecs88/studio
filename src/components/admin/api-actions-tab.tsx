"use client";

import { useState } from "react";
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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type ApiAction, type Environment } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddApiActionDialog from "./add-api-action-dialog";
import EditApiActionDialog from "./edit-api-action-dialog";
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

interface ApiActionsTabProps {
  apiActions: ApiAction[];
  setApiActions: React.Dispatch<React.SetStateAction<ApiAction[]>>;
  environments: Environment[];
  onApiActionUpdated: (updatedApiAction: ApiAction) => void;
}

export default function ApiActionsTab({ apiActions, setApiActions, environments, onApiActionUpdated }: ApiActionsTabProps) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ApiAction | null>(null);

  const handleEditClick = (action: ApiAction) => {
    setSelectedAction(action);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (action: ApiAction) => {
    setSelectedAction(action);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedAction) {
      setApiActions(apiActions.filter(action => action.id !== selectedAction.id));
      setDeleteDialogOpen(false);
      setSelectedAction(null);
    }
  }

  const handleAddApiAction = (newActionData: { key: string; value: string; environmentId: string }) => {
    const newAction: ApiAction = {
      id: `action_${Date.now()}`,
      ...newActionData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApiActions(prevActions => [...prevActions, newAction]);
    setAddDialogOpen(false);
  };

  const handleApiActionUpdated = (updatedActionData: Omit<ApiAction, 'createdAt'>) => {
    const originalAction = apiActions.find(a => a.id === updatedActionData.id);
    if(originalAction) {
      onApiActionUpdated({ ...updatedActionData, createdAt: originalAction.createdAt });
    }
  };

  const getEnvironmentName = (environmentId: string) => {
    const env = environments.find((e) => e.id === environmentId);
    return env ? env.name : "Unknown";
  };

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Actions</CardTitle>
                <CardDescription>
                  Manage API action key-value pairs for environments.
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add API Action
                  </span>
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiActions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.key}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {action.value}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEnvironmentName(action.environmentId)}</TableCell>
                    <TableCell>{action.createdAt}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleEditClick(action)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteClick(action)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <AddApiActionDialog onApiActionAdded={handleAddApiAction} environments={environments} />
      </Dialog>
      {selectedAction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditApiActionDialog 
                apiAction={selectedAction} 
                onOpenChange={setEditDialogOpen}
                environments={environments} 
                onApiActionUpdated={handleApiActionUpdated}
            />
        </Dialog>
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the API action with key "{selectedAction?.key}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
