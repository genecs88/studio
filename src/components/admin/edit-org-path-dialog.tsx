"use client";

import { useEffect } from "react";
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
import { organizations, type OrgPath } from "@/lib/placeholder-data";

const orgPathSchema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  path: z.string().min(1, "Org path data is required"),
});

interface EditOrgPathDialogProps {
  orgPath: OrgPath;
  onOpenChange: (open: boolean) => void;
}

export default function EditOrgPathDialog({ orgPath, onOpenChange }: EditOrgPathDialogProps) {
  const form = useForm<z.infer<typeof orgPathSchema>>({
    resolver: zodResolver(orgPathSchema),
    defaultValues: {
      organizationId: orgPath.organizationId,
      path: orgPath.path,
    },
  });

  useEffect(() => {
    form.reset({
      organizationId: orgPath.organizationId,
      path: orgPath.path,
    });
  }, [orgPath, form]);

  const onSubmit = (values: z.infer<typeof orgPathSchema>) => {
    console.log("Updated values:", { id: orgPath.id, ...values });
    alert("Org Path updated (see console for data).");
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
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
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
