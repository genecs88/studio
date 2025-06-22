
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

const environmentSchema = z.object({
  name: z.string().min(1, "Environment name is required"),
  url: z.string().url("Please enter a valid URL"),
});

interface AddEnvironmentDialogProps {
  onEnvironmentAdded: (newEnv: Omit<Environment, 'id'>) => Promise<void>;
  closeDialog: () => void;
}

export default function AddEnvironmentDialog({ onEnvironmentAdded, closeDialog }: AddEnvironmentDialogProps) {
  const form = useForm<z.infer<typeof environmentSchema>>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof environmentSchema>) => {
    await onEnvironmentAdded(values);
    form.reset();
    closeDialog();
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
                  <Input placeholder="e.g., Production" {...field} />
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
                  <Input placeholder="e.g., https://api.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Environment</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
