
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
import type { Environment } from "@/lib/placeholder-data";

const environmentSchema = z.object({
  name: z.string().min(1, "Environment name is required"),
  url: z.string().url("Please enter a valid URL"),
});

interface EditEnvironmentDialogProps {
  environment: Environment;
  onOpenChange: (open: boolean) => void;
  onEnvironmentUpdated: (updatedEnv: Environment) => Promise<void>;
}

export default function EditEnvironmentDialog({ environment, onOpenChange, onEnvironmentUpdated }: EditEnvironmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof environmentSchema>>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: environment.name,
      url: environment.url,
    },
  });

  useEffect(() => {
    form.reset({
      name: environment.name,
      url: environment.url,
    });
  }, [environment, form]);

  const onSubmit = async (values: z.infer<typeof environmentSchema>) => {
    setIsSubmitting(true);
    try {
      await onEnvironmentUpdated({ ...environment, ...values });
      toast({
        title: "Success!",
        description: `Environment "${values.name}" has been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update the environment.";
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
        <DialogTitle>Edit Environment</DialogTitle>
        <DialogDescription>
          Make changes to the environment below.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Environment Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Production" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., https://api.example.com" {...field} disabled={isSubmitting} />
                </FormControl>
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
