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
import { organizations as initialOrganizations, environments, type Organization } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddOrganizationDialog, { type NewOrganizationData } from "./add-organization-dialog";
import EditOrganizationDialog from "./edit-organization-dialog";
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

export default function OrganizationsTab() {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const handleEditClick = (org: Organization) => {
    setSelectedOrg(org);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedOrg) {
      setOrganizations(organizations.filter((org) => org.id !== selectedOrg.id));
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
    }
  };

  const getEnvironmentName = (environmentId: string) => {
    const env = environments.find((e) => e.id === environmentId);
    return env ? env.name : "Unknown";
  };
  
  const handleAddOrganization = (newOrgData: NewOrganizationData) => {
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name: newOrgData.name,
      environmentId: newOrgData.environmentId,
      patientIdentifiers: newOrgData.patientIdentifiers || [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrganizations(prevOrgs => [...prevOrgs, newOrg]);
    setAddDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>
                  Manage all registered organizations.
                </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Organization
                  </span>
                </Button>
              </DialogTrigger>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{getEnvironmentName(org.environmentId)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{org.id}</Badge>
                    </TableCell>
                    <TableCell>{org.createdAt}</TableCell>
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
                          <DropdownMenuItem onSelect={() => handleEditClick(org)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteClick(org)}>
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
        <AddOrganizationDialog onOrganizationAdded={handleAddOrganization} />
      </Dialog>
      {selectedOrg && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
          <EditOrganizationDialog organization={selectedOrg} onOpenChange={setEditDialogOpen} />
        </Dialog>
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization
              "{selectedOrg?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedOrg(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
