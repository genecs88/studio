
"use client";

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
import { type Environment } from "@/lib/placeholder-data";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const environmentSchema = z.object({
  name: z.string().min(1, "Environment name is required"),
  url: z.string().url("Please enter a valid URL"),
});

interface AddEnvironmentDialogProps {
  onEnvironmentAdded: (newEnv: Omit<Environment, 'id'>) => Promise<void>;
  closeDialog: () => void;
}

export default function AddEnvironmentDialog({ onEnvironmentAdded, closeDialog }: AddEnvironmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof environmentSchema>>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof environmentSchema>) => {
    setIsSubmitting(true);
    try {
      await onEnvironmentAdded(values);
      toast({
        title: "Success!",
        description: `Environment "${values.name}" has been added.`,
      });
      form.reset();
      closeDialog();
    } catch (error) {
      console.error("Failed to add environment", error);
      const message = error instanceof Error ? error.message : "Could not add the environment. Please try again.";
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
        <DialogTitle>Add New Environment</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new environment.
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
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Environment"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
