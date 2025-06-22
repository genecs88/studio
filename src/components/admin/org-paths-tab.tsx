
"use client";

import { useState } from "react";
import { useAppData } from "@/context/app-data-context";
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
import { type Organization, type OrgPath, type Environment } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddOrgPathDialog from "./add-org-path-dialog";
import { Badge } from "../ui/badge";
import EditOrgPathDialog from "./edit-org-path-dialog";
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

interface OrgPathsTabProps {
  orgPaths: OrgPath[];
  organizations: Organization[];
  environments: Environment[];
}

export default function OrgPathsTab({ orgPaths, organizations, environments }: OrgPathsTabProps) {
  const { addOrgPath, updateOrgPath, deleteOrgPath } = useAppData();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<OrgPath | null>(null);

  const handleEditClick = (path: OrgPath) => {
    setSelectedPath(path);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (path: OrgPath) => {
    setSelectedPath(path);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedPath) {
      await deleteOrgPath(selectedPath.id);
      setDeleteDialogOpen(false);
      setSelectedPath(null);
    }
  };

  const getOrganizationName = (organizationId: string) => {
    const org = organizations.find((o) => o.id === organizationId);
    return org ? org.name : "Unknown";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Org Paths</CardTitle>
              <CardDescription>
                Manage all registered organization paths.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Org Path
                  </span>
                </Button>
              </DialogTrigger>
              <AddOrgPathDialog 
                onOrgPathAdded={addOrgPath} 
                organizations={organizations} 
                environments={environments}
                closeDialog={() => setAddDialogOpen(false)}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgPaths.map((path) => (
                <TableRow key={path.id}>
                  <TableCell className="font-medium">
                    {getOrganizationName(path.organizationId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {path.path}
                    </Badge>
                  </TableCell>
                  <TableCell>{path.createdAt}</TableCell>
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
                        <DropdownMenuItem onSelect={() => handleEditClick(path)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteClick(path)}>
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
      
      {selectedPath && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditOrgPathDialog 
                orgPath={selectedPath} 
                onOpenChange={setEditDialogOpen}
                organizations={organizations}
                environments={environments}
                onOrgPathUpdated={updateOrgPath}
            />
        </Dialog>
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the org path.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPath(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
