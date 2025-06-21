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
import { environments, type Organization } from "@/lib/placeholder-data";
import { PlusCircle, X } from "lucide-react";

const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  environmentId: z.string().min(1, "Environment is required"),
  patientIdentifiers: z
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
  onOpenChange: (open: boolean) => void;
}

export default function EditOrganizationDialog({ organization, onOpenChange }: EditOrganizationDialogProps) {
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      environmentId: organization.environmentId,
      patientIdentifiers: organization.patientIdentifiers || [],
    },
  });

  useEffect(() => {
    form.reset({
      name: organization.name,
      environmentId: organization.environmentId,
      patientIdentifiers: organization.patientIdentifiers || [],
    });
  }, [organization, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "patientIdentifiers",
  });

  const onSubmit = (values: z.infer<typeof organizationSchema>) => {
    console.log("Updated values:", { id: organization.id, ...values });
    alert("Organization updated (see console for data).");
    onOpenChange(false);
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
                    <Input placeholder="Acme Inc." {...field} />
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
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Patient Identifiers</Label>
              <p className="text-sm text-muted-foreground">
                Define up to 4 key-value pairs for patient identification.
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
                    name={`patientIdentifiers.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key {index + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MRN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`patientIdentifiers.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value {index + 1}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., medical_record_num"
                            {...field}
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
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Identifier
              </Button>
            )}
          </div>

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
