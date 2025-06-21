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
import {
  environments,
  organizations,
  type Organization,
  type ApiKey,
} from "@/lib/placeholder-data";

const apiKeySchema = z.object({
  environmentId: z.string().min(1, "Environment is required"),
  organizationId: z.string().min(1, "Organization is required"),
  key: z.string().min(1, "API Key is required"),
});

interface EditApiKeyDialogProps {
    apiKey: ApiKey;
    onOpenChange: (open: boolean) => void;
}

const findOrgId = (name: string) => organizations.find(o => o.name === name)?.id;
const findEnvId = (name: string) => environments.find(e => e.name === name)?.id;

export default function EditApiKeyDialog({ apiKey, onOpenChange }: EditApiKeyDialogProps) {
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  
  const form = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      environmentId: findEnvId(apiKey.environment) || "",
      organizationId: findOrgId(apiKey.organization) || "",
      key: apiKey.key,
    },
  });
  
  const selectedEnvironmentId = form.watch("environmentId");

  useEffect(() => {
    form.reset({
      environmentId: findEnvId(apiKey.environment) || "",
      organizationId: findOrgId(apiKey.organization) || "",
      key: apiKey.key,
    });
  }, [apiKey, form]);

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
  }, [selectedEnvironmentId, form]);

  const onSubmit = (values: z.infer<typeof apiKeySchema>) => {
    console.log("Updated values:", { id: apiKey.id, ...values });
    alert("API Key updated (see console for data).");
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit API Key</DialogTitle>
        <DialogDescription>
          Make changes to your API Key below. The key itself cannot be changed.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
