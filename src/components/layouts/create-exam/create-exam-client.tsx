"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createExam } from "@/actions/create-exam";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ExamConfig } from "@/types/exam-config";

const examSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startTime: z.date({ message: "Start time is required" }),
  endTime: z.date({ message: "End time is required" }),
  durationMinutes: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute"),
  problemIds: z
    .array(z.string())
    .min(1, "At least one problem must be selected"),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface CreateExamClientProps {
  collections: any[];
  problems: any[];
}

export default function CreateExamClient({
  collections,
  problems,
}: CreateExamClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      durationMinutes: 60,
      problemIds: [],
    },
  });

  const selectedProblemIds = form.watch("problemIds");

  const filteredProblems = problems.filter((problem) =>
    problem.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleProblem = (problemId: string) => {
    const current = form.getValues("problemIds");
    const index = current.indexOf(problemId);
    if (index === -1) {
      form.setValue("problemIds", [...current, problemId]);
    } else {
      form.setValue(
        "problemIds",
        current.filter((id) => id !== problemId),
      );
    }
  };

  const onSubmit = async (values: ExamFormValues) => {
    setIsSubmitting(true);
    try {
      const config: ExamConfig = {
        strategy: "fixed",
        problemIds: values.problemIds,
      };

      const result = await createExam({
        title: values.title,
        startTime: values.startTime,
        endTime: values.endTime,
        durationMinutes: values.durationMinutes,
        config,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Exam created successfully!");
        router.push("/exams");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Exam</h1>
          <p className="text-muted-foreground">
            Configure exam details and select problems.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 gap-6 overflow-hidden"
        >
          <Tabs
            defaultValue="details"
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <TabsList>
                <TabsTrigger value="details">Exam Details</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Exam
                </Button>
              </div>
            </div>

            <TabsContent value="details" className="flex-1 overflow-auto py-4">
              <div className="grid gap-6 max-w-2xl">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Midterm Exam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                onChange={(e) => {
                                  const date = field.value || new Date();
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Time</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP HH:mm")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                onChange={(e) => {
                                  const date = field.value || new Date();
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  date.setHours(
                                    parseInt(hours),
                                    parseInt(minutes),
                                  );
                                  field.onChange(date);
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormDescription>
                        Actual time allowed for the student once they start.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="problems"
              className="flex-1 overflow-hidden data-[state=active]:flex flex-col"
            >
              <ResizablePanelGroup
                orientation="horizontal"
                className="h-full border rounded-md"
              >
                {/* Available Problems */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between border-b p-4">
                      <h3 className="font-semibold">Available Problems</h3>
                      <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search problems..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-2">
                        {filteredProblems.map((problem) => (
                          <div
                            key={problem.id}
                            className="flex items-center space-x-3 rounded-md border p-3 hover:bg-accent/50 cursor-pointer"
                            onClick={() => toggleProblem(problem.id)}
                          >
                            <Checkbox
                              checked={selectedProblemIds.includes(problem.id)}
                              onCheckedChange={() => toggleProblem(problem.id)}
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {problem.title}
                                </span>
                                <Badge variant="outline">
                                  {problem.difficulty}
                                </Badge>
                                <Badge variant="secondary">
                                  {problem.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {problem.slug}
                              </p>
                            </div>
                          </div>
                        ))}
                        {filteredProblems.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No problems found.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Selected Problems */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="flex h-full flex-col bg-muted/10">
                    <div className="flex items-center justify-between border-b p-4">
                      <h3 className="font-semibold">
                        Selected Problems ({selectedProblemIds.length})
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue("problemIds", [])}
                        disabled={selectedProblemIds.length === 0}
                      >
                        Clear All
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                      {selectedProblemIds.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                          <p>No problems selected.</p>
                          <p className="text-sm">
                            Select problems from the list to add them.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedProblemIds.map((id) => {
                            const problem = problems.find((p) => p.id === id);
                            if (!problem) return null;
                            return (
                              <div
                                key={id}
                                className="flex items-center justify-between rounded-md border bg-background p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {problem.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {problem.difficulty}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleProblem(id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
