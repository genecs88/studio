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
import { apiActions, environments, type ApiAction } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddApiActionDialog from "./add-api-action-dialog";
import EditApiActionDialog from "./edit-api-action-dialog";

export default function ApiActionsTab() {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ApiAction | null>(null);

  const handleEditClick = (action: ApiAction) => {
    setSelectedAction(action);
    setEditDialogOpen(true);
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
                          <DropdownMenuItem className="text-destructive">
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
        <AddApiActionDialog />
      </Dialog>
      {selectedAction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditApiActionDialog apiAction={selectedAction} onOpenChange={setEditDialogOpen} />
        </Dialog>
      )}
    </>
  );
}
