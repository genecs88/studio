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
import { Globe, MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { environments, type Environment } from "@/lib/placeholder-data";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import AddEnvironmentDialog from "./add-environment-dialog";

const EnvironmentIcon = ({ name }: { name: Environment["name"] }) => {
    return <Globe className="h-5 w-5 text-muted-foreground" />;
}


export default function EnvironmentsTab() {
  return (
    <Dialog>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
              <div>
                  <CardTitle>Environments</CardTitle>
                  <CardDescription>
                  Define the environments for your API keys.
                  </CardDescription>
              </div>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Environment
                    </span>
                </Button>
              </DialogTrigger>
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
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddEnvironmentDialog />
    </Dialog>
  );
}
