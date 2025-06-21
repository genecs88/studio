
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
import { Globe, MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Environment } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddEnvironmentDialog from "./add-environment-dialog";
import EditEnvironmentDialog from "./edit-environment-dialog";
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

const EnvironmentIcon = ({ name }: { name: Environment["name"] }) => {
    return <Globe className="h-5 w-5 text-muted-foreground" />;
}

interface EnvironmentsTabProps {
  environments: Environment[];
  setEnvironments: React.Dispatch<React.SetStateAction<Environment[]>>;
}

export default function EnvironmentsTab({ environments, setEnvironments }: EnvironmentsTabProps) {
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);

  const handleEditClick = (env: Environment) => {
    setSelectedEnv(env);
    setEditDialogOpen(true);
  };
  
  const handleDeleteClick = (env: Environment) => {
    setSelectedEnv(env);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedEnv) {
      setEnvironments(environments.filter((env) => env.id !== selectedEnv.id));
      setDeleteDialogOpen(false);
      setSelectedEnv(null);
    }
  };

  const handleAddEnvironment = (newEnvData: { name: string; url: string }) => {
    const newEnv: Environment = {
      id: `env_${Date.now()}`,
      name: newEnvData.name,
      url: newEnvData.url,
    };
    setEnvironments(prevEnvs => [...prevEnvs, newEnv]);
    setAddDialogOpen(false);
  };

  const onEnvironmentUpdated = (updatedEnv: Environment) => {
    setEnvironments(envs => envs.map(env => env.id === updatedEnv.id ? updatedEnv : env));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environments</CardTitle>
              <CardDescription>
                Define the environments for your API keys.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Environment
                  </span>
                </Button>
              </DialogTrigger>
              <AddEnvironmentDialog onEnvironmentAdded={handleAddEnvironment} />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {environments.map((env) => (
                <TableRow key={env.id}>
                  <TableCell>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                      <EnvironmentIcon name={env.name} />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{env.name}</TableCell>
                  <TableCell>{env.url}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{env.id}</Badge>
                  </TableCell>
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
                        <DropdownMenuItem onSelect={() => handleEditClick(env)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteClick(env)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {selectedEnv && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <EditEnvironmentDialog environment={selectedEnv} onOpenChange={setEditDialogOpen} onEnvironmentUpdated={onEnvironmentUpdated} />
        </Dialog>
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the environment
              "{selectedEnv?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedEnv(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
