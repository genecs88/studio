
"use client";

import { useState, useEffect } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { useToast } from "@/hooks/use-toast";
import { type Organization, type Environment } from "@/lib/placeholder-data";

const orgPathSchema = z.object({
  environmentId: z.string().min(1, "Environment is required"),
  organizationId: z.string().min(1, "Organization is required"),
  path: z.string().min(1, "Org path data is required"),
});

interface AddOrgPathDialogProps {
    onOrgPathAdded: (newPath: { organizationId: string; path: string; }) => Promise<void>;
    organizations: Organization[];
    environments: Environment[];
    closeDialog: () => void;
}

export default function AddOrgPathDialog({ onOrgPathAdded, organizations, environments, closeDialog }: AddOrgPathDialogProps) {
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof orgPathSchema>>({
    resolver: zodResolver(orgPathSchema),
    defaultValues: {
      environmentId: "",
      organizationId: "",
      path: "",
    },
  });

  const selectedEnvironmentId = form.watch("environmentId");

  useEffect(() => {
    if (selectedEnvironmentId) {
      const filtered = organizations.filter(
        (org) => org.environmentId === selectedEnvironmentId
      );
      setFilteredOrganizations(filtered);
      form.setValue("organizationId", ""); // Reset organization when environment changes
    } else {
      setFilteredOrganizations([]);
    }
  }, [selectedEnvironmentId, form, organizations]);

  const onSubmit = async (values: z.infer<typeof orgPathSchema>) => {
    setIsSubmitting(true);
    try {
      await onOrgPathAdded({ organizationId: values.organizationId, path: values.path });
      toast({
        title: "Success!",
        description: "Organization path has been added.",
      });
      form.reset();
      setFilteredOrganizations([]);
      closeDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Adding Org Path",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Org Path</DialogTitle>
        <DialogDescription>
          Select an environment and organization, then enter the path data.
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
                  defaultValue={field.value}
                  disabled={isSubmitting}
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
                  disabled={!selectedEnvironmentId || isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Org Path"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
