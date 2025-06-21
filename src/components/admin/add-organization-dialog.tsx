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
import { environments } from "@/lib/placeholder-data";
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

export type NewOrganizationData = z.infer<typeof organizationSchema>;

interface AddOrganizationDialogProps {
  onOrganizationAdded: (newOrg: NewOrganizationData) => void;
}

export default function AddOrganizationDialog({ onOrganizationAdded }: AddOrganizationDialogProps) {
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      environmentId: "",
      studyIdentifiers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "studyIdentifiers",
  });

  const onSubmit = (values: z.infer<typeof organizationSchema>) => {
    onOrganizationAdded(values);
    form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Add New Organization</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new organization.
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
                    defaultValue={field.value}
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
                          <Input placeholder="e.g., MRN" {...field} />
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
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Organization</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
