
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
import { Input } from "@/components/ui/input";
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
import {
  type Environment,
  type Organization,
} from "@/lib/placeholder-data";

const apiKeySchema = z.object({
  environmentId: z.string().min(1, "Environment is required"),
  organizationId: z.string().min(1, "Organization is required"),
  key: z.string().min(1, "API Key is required"),
});

interface AddApiKeyDialogProps {
    onApiKeyAdded: (newKey: { organizationId: string; environmentId: string; key: string }) => Promise<void>;
    organizations: Organization[];
    environments: Environment[];
    closeDialog: () => void;
}

export default function AddApiKeyDialog({ onApiKeyAdded, organizations, environments, closeDialog }: AddApiKeyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);

  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      environmentId: "",
      organizationId: "",
      key: "",
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

  const onSubmit = async (values: z.infer<typeof apiKeySchema>) => {
    setIsSubmitting(true);
    try {
      await onApiKeyAdded(values);
      toast({
        title: "Success!",
        description: "API Key has been added.",
      });
      form.reset();
      setFilteredOrganizations([]);
      closeDialog();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Error Adding API Key",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogDescription>
          Select an environment and organization, then enter the API key.
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
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter API Key" {...field} disabled={isSubmitting} />
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
              {isSubmitting ? "Adding..." : "Add Key"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
