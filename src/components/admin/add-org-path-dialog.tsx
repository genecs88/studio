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
import { organizations } from "@/lib/placeholder-data";

const orgPathSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  path: z.string().min(1, "Org path data is required"),
});

interface AddOrgPathDialogProps {
    onOrgPathAdded: (newPath: z.infer<typeof orgPathSchema>) => void;
}

export default function AddOrgPathDialog({ onOrgPathAdded }: AddOrgPathDialogProps) {
  const form = useForm<z.infer<typeof orgPathSchema>>({
    resolver: zodResolver(orgPathSchema),
    defaultValues: {
      organizationId: "",
      path: "",
    },
  });

  const onSubmit = (values: z.infer<typeof orgPathSchema>) => {
    onOrgPathAdded(values);
    form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add New Org Path</DialogTitle>
        <DialogDescription>
          Select an organization and enter the path data.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
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
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Org Path</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
