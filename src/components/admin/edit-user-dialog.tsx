
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
import type { User } from "@/lib/placeholder-data";

const userSchema = z.object({
  name: z.string().min(1, "User name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  user: User;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: (updatedUser: User) => Promise<void>;
}

export default function EditUserDialog({ user, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      password: "",
    });
  }, [user, form]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const updatedUser: User = {
        ...user,
        name: values.name,
        email: values.email,
        // Only update password if a new one is provided
        password: values.password ? values.password : user.password,
      };
      await onUserUpdated(updatedUser);
      toast({
        title: "Success!",
        description: `User "${values.name}" has been updated.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update user.";
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
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>
          Make changes to the user below.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Doe" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="e.g., jane@example.com" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Leave blank to keep current password" {...field} disabled={isSubmitting} />
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
