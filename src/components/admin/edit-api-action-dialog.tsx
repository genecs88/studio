
"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { ApiAction, Environment } from "@/lib/placeholder-data";

const apiActionSchema = z.object({
  key: z.string().min(1, "Key name is required"),
  value: z.string().min(1, "Value is required"),
  environmentId: z.string().min(1, "Environment is required"),
});

type ApiActionFormValues = z.infer<typeof apiActionSchema>;

interface EditApiActionDialogProps {
  apiAction: ApiAction;
  environments: Environment[];
  onOpenChange: (open: boolean) => void;
  onApiActionUpdated: (updatedAction: Omit<ApiAction, 'createdAt'>) => Promise<void>;
}

export default function EditApiActionDialog({ apiAction, environments, onOpenChange, onApiActionUpdated }: EditApiActionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApiActionFormValues>({
    resolver: zodResolver(apiActionSchema),
    defaultValues: {
      key: apiAction.key,
      value: apiAction.value,
      environmentId: apiAction.environmentId,
    },
  });

  useEffect(() => {
    form.reset({
      key: apiAction.key,
      value: apiAction.value,
      environmentId: apiAction.environmentId,
    });
  }, [apiAction, form]);

  const onSubmit = async (values: ApiActionFormValues) => {
    setIsSubmitting(true);
    try {
      await onApiActionUpdated({ id: apiAction.id, ...values });
      toast({
        title: "Success!",
        description: "API Action has been updated.",
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update API Action.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit API Action</DialogTitle>
        <DialogDescription>
          Make changes to the API Action below.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., default_model" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., gemini-1.5-pro" {...field} disabled={isSubmitting} />
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
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
