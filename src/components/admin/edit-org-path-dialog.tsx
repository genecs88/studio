"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Organization, type OrgPath, type Environment } from "@/lib/placeholder-data";

const orgPathSchema = z.object({
  environmentId: z.string().min(1, "Environment is required"),
  organizationId: z.string().min(1, "Organization is required"),
  path: z.string().min(1, "Org path data is required"),
});

type OrgPathFormValues = z.infer<typeof orgPathSchema>;

interface EditOrgPathDialogProps {
  orgPath: OrgPath;
  organizations: Organization[];
  environments: Environment[];
  onOpenChange: (open: boolean) => void;
  onOrgPathUpdated: (updatedOrgPath: Omit<OrgPath, 'createdAt'>) => void;
}

export default function EditOrgPathDialog({ orgPath, organizations, environments, onOpenChange, onOrgPathUpdated }: EditOrgPathDialogProps) {
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  
  const initialOrg = organizations.find(o => o.id === orgPath.organizationId);
  const initialEnvId = initialOrg ? initialOrg.environmentId : "";

  const form = useForm<OrgPathFormValues>({
    resolver: zodResolver(orgPathSchema),
    defaultValues: {
      environmentId: initialEnvId,
      organizationId: orgPath.organizationId,
      path: orgPath.path,
    },
  });

  const selectedEnvironmentId = form.watch("environmentId");

  useEffect(() => {
    const org = organizations.find(o => o.id === orgPath.organizationId);
    const envId = org ? org.environmentId : "";
    form.reset({
      environmentId: envId,
      organizationId: orgPath.organizationId,
      path: orgPath.path,
    });
  }, [orgPath, form, organizations]);
  
  useEffect(() => {
    if (selectedEnvironmentId) {
      const filtered = organizations.filter(
        (org) => org.environmentId === selectedEnvironmentId
      );
      setFilteredOrganizations(filtered);

      const currentOrgId = form.getValues("organizationId");
      if (!filtered.some(org => org.id === currentOrgId)) {
          form.setValue("organizationId", "");
      }
    } else {
      setFilteredOrganizations([]);
      form.setValue("organizationId", "");
    }
  }, [selectedEnvironmentId, form, organizations]);

  const onSubmit = (values: OrgPathFormValues) => {
    onOrgPathUpdated({ id: orgPath.id, organizationId: values.organizationId, path: values.path });
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Org Path</DialogTitle>
        <DialogDescription>
          Make changes to the org path below.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
            control={form.control}
            name="environmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Environment</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an environment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {environments.map((env) => (
                      <SelectItem key={env.id} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedEnvironmentId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredOrganizations.length > 0 ? (
                      filteredOrganizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No organizations for this environment
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="path"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Org Path Data</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter comma-separated data, e.g., dept,region,group"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
