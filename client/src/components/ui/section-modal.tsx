import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSectionSchema, type Section, type InsertSection } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface SectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InsertSection) => void;
  section?: Section | null;
  isLoading?: boolean;
}

export function SectionModal({ open, onClose, onSubmit, section, isLoading }: SectionModalProps) {
  const form = useForm<InsertSection>({
    resolver: zodResolver(insertSectionSchema),
    defaultValues: { name: "", description: "", status: "active" },
  });

  useEffect(() => {
    if (open) {
      if (section) {
        form.reset({
          name: section.sectionName,
          description: section.description || "",
          status: section.status,
        });
      } else {
        form.reset({ name: "", description: "", status: "active" });
      }
    }
  }, [section, open, form.reset]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{section ? "Edit Section" : "Add New Section"}</DialogTitle>
          <DialogDescription>
            {section ? "Make changes to your section here." : "Add a new section to your list."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="section-form" className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">Section Name</Label>
                <FormControl><Input id="name" placeholder="Enter section name" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <Label htmlFor="description">Description</Label>
                <FormControl><Textarea id="description" placeholder="Enter section description" rows={3} {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <Label>Status</Label>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading} form="section-form">
                {isLoading ? "Saving..." : "Save Section"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}