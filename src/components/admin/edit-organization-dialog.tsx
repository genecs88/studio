
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
import { Label } from "@/components/ui/label";
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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Environment, Organization } from "@/lib/placeholder-data";
import { PlusCircle, X } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  environmentId: z.string().min(1, "Environment is required"),
  studyIdentifiers: z
    .array(
      z.object({
        key: z.string().min(1, "Key name is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .max(4, "You can add up to 4 identifiers")
    .optional(),
});

interface EditOrganizationDialogProps {
  organization: Organization;
  environments: Environment[];
  onOpenChange: (open: boolean) => void;
  onOrganizationUpdated: (updatedOrg: Omit<Organization, 'createdAt'>) => Promise<void>;
}

export default function EditOrganizationDialog({ organization, environments, onOpenChange, onOrganizationUpdated }: EditOrganizationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      environmentId: organization.environmentId,
      studyIdentifiers: organization.studyIdentifiers || [],
    },
  });

  useEffect(() => {
    form.reset({
      name: organization.name,
      environmentId: organization.environmentId,
      studyIdentifiers: organization.studyIdentifiers || [],
    });
  }, [organization, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "studyIdentifiers",
  });

  const onSubmit = async (values: z.infer<typeof organizationSchema>) => {
    setIsSubmitting(true);
    try {
      await onOrganizationUpdated({ id: organization.id, ...values });
      toast({
        title: "Success!",
        description: `Organization "${values.name}" has been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update organization.";
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
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogDescription>
          Make changes to your organization here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} disabled={isSubmitting} />
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
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Study Identifiers</Label>
              <p className="text-sm text-muted-foreground">
                add up to 4 key value pairs for study uniqueness - this was defined during integration
              </p>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-end gap-2"
                >
                  <FormField
                    control={form.control}
                    name={`studyIdentifiers.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key {index + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MRN" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`studyIdentifiers.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., medical_record_num"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove identifier</span>
                  </Button>
                </div>
              ))}
            </div>

            {fields.length < 4 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ key: "", value: "" })}
                disabled={isSubmitting || fields.length >= 4}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Identifier
              </Button>
            )}
          </div>

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
