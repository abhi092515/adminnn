import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { type Topic, type InsertTopic } from "@/hooks/use-topics";
import { useSections } from "@/hooks/use-sections"; // To fetch sections for the dropdown

// Zod schema for form validation, based on your backend schema
const insertTopicSchema = z.object({
  name: z.string().min(1, "Topic name is required."),
  status: z.enum(["active", "inactive"]),
  section: z.string().min(1, "A section must be selected."),
});

interface TopicModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: InsertTopic) => void;
  topic?: Topic | null;
  isLoading?: boolean;
}

export function TopicModal({ open, onClose, onSubmit, topic, isLoading }: TopicModalProps) {
  // Fetch sections to populate the dropdown
  const { sections, isLoading: isLoadingSections } = useSections();

  const form = useForm<InsertTopic>({
    resolver: zodResolver(insertTopicSchema),
    defaultValues: { name: "", status: "active", section: "" },
  });

  useEffect(() => {
    if (open) {
      if (topic) {
        form.reset({
          name: topic.topicName,
          status: topic.status,
          section: topic.section._id, // Set the section ID for the dropdown
        });
      } else {
        form.reset({ name: "", status: "active", section: "" });
      }
    }
  }, [topic, open, form.reset]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit Topic" : "Add New Topic"}</DialogTitle>
          <DialogDescription>
            {topic ? "Make changes to your topic here." : "Add a new topic to your list."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="topic-form" className="space-y-4 pt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <Label htmlFor="name">Topic Name</Label>
                <FormControl><Input id="name" placeholder="Enter topic name" {...field} disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="section" render={({ field }) => (
              <FormItem>
                <Label>Section</Label>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isLoadingSections}>
                  <FormControl><SelectTrigger>
                    <SelectValue placeholder={isLoadingSections ? "Loading sections..." : "Select a section"} />
                  </SelectTrigger></FormControl>
                  <SelectContent>
                    {sections?.map((section) => (
                      <SelectItem key={section.id} value={section.id}>{section.sectionName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="submit" disabled={isLoading} form="topic-form">
                {isLoading ? "Saving..." : "Save Topic"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}