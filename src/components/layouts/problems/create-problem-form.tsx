"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createProblem } from "@/actions/create-problem";
import { getCollections } from "@/actions/collections-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  collectionId: z.string().optional(),
  type: z.enum(["coding", "mcq_single", "mcq_multi", "true_false", "descriptive"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  description: z.string().min(1, "Description is required"),
  // Driver code fields (for coding problems)
  javaCode: z.string().optional(),
  // Grading metadata fields
  timeLimit: z.string().optional(),
  memoryLimit: z.string().optional(),
  public: z.boolean().default(false),
  testCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      expectedOutput: z.string().min(1, "Expected output is required"),
      isHidden: z.boolean().default(true),
    }),
  ).optional(),
});

type ProblemFormValues = z.infer<typeof problemSchema>;

const DEFAULT_DESCRIPTION = `# Problem Title

Provide a clear and concise problem description here.

## Example 1:

\`\`\`
Input: [example input]
Output: [example output]
Explanation: [optional explanation]
\`\`\`

## Example 2:

\`\`\`
Input: [example input]
Output: [example output]
\`\`\`

## Constraints:

- [Constraint 1]
- [Constraint 2]
- [Constraint 3]`;

export function CreateProblemForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collections, setCollections] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [collectionsLoaded, setCollectionsLoaded] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("basic"),
  );

  const form = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: "",
      slug: "",
      collectionId: "",
      type: "coding" as const,
      difficulty: "easy" as const,
      description: DEFAULT_DESCRIPTION,
      javaCode: "",
      timeLimit: "1000",
      memoryLimit: "256",
      public: false,
      testCases: [],
    },
  });

  const { fields: testCaseFields, append: appendTestCase, remove: removeTestCase } = useFieldArray({
    control: form.control,
    name: "testCases",
  });

  // Load collections on mount
  useEffect(() => {
    if (!collectionsLoaded) {
      getCollections({ perPage: 100 }).then((result) => {
        setCollections(result.data);
        setCollectionsLoaded(true);
      });
    }
  }, [collectionsLoaded]);

  // Generate slug from title
  const generateSlugFromTitle = () => {
    if (!slugManuallyEdited) {
      const title = form.getValues("title");
      if (title) {
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        form.setValue("slug", slug);
      }
    }
  };

  const onSubmit = async (values: ProblemFormValues) => {
    setIsSubmitting(true);

    try {
      // Build content JSON in ProseMirror format (simple wrapper for description)
      const content = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "See description for details." }],
          },
        ],
      };

      // Build driver code JSON (only if Java code is provided)
      let driverCode: Record<string, string> | undefined;
      if (values.javaCode) {
        driverCode = {
          java: values.javaCode,
        };
      }

      // Build grading metadata JSON
      let gradingMetadata: Record<string, any> | undefined;
      if (values.timeLimit || values.memoryLimit) {
        gradingMetadata = {};
        if (values.timeLimit) gradingMetadata.timeLimit = parseInt(values.timeLimit, 10);
        if (values.memoryLimit) gradingMetadata.memoryLimit = parseInt(values.memoryLimit, 10);
      }

      const result = await createProblem({
        title: values.title,
        slug: values.slug,
        collectionId: values.collectionId,
        type: values.type,
        difficulty: values.difficulty,
        description: values.description,
        content,
        driverCode,
        gradingMetadata,
        public: values.public,
        testCases: values.testCases,
      });

      console.log("Test cases being sent:", values.testCases);
      console.log("Create problem result:", result);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Problem created successfully!");
        router.push(`/problem/${result.slug}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create problem. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={tab ?? undefined} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="code">Starter Code</TabsTrigger>
            <TabsTrigger value="tests">Test Cases</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Two Sum"
                      {...field}
                      onBlur={generateSlugFromTitle}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., two-sum"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSlugManuallyEdited(true);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    URL-friendly identifier (lowercase, hyphens only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="mcq_single">MCQ (Single)</SelectItem>
                        <SelectItem value="mcq_multi">MCQ (Multiple)</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="descriptive">Descriptive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
              control={form.control}
              name="collectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collection</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            

            <FormField
              control={form.control}
              name="public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this problem public</FormLabel>
                    <FormDescription>
                      Public problems are visible to all users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Markdown Supported) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the full problem description with examples and constraints..."
                          className="min-h-[500px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Write the complete problem description using Markdown. Include title, description, examples, and constraints.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Starter Code Tab */}
          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle>Starter Code (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Provide a starter code template for Java
                </p>

                <FormField
                  control={form.control}
                  name="javaCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Java</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="public int solution(int[] nums) {&#10;    // Your code here&#10;}"
                          className="min-h-[150px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Limit (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum execution time in milliseconds
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="memoryLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memory Limit (MB)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="256"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum memory usage in megabytes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Cases Tab */}
          <TabsContent value="tests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Test Cases</CardTitle>
                <Button
                  type="button"
                  variant="outline"
              size="sm"
              onClick={() =>
                appendTestCase({ input: "", expectedOutput: "", isHidden: false })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Test Case
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {testCaseFields.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No test cases added yet. Click "Add Test Case" to get started.
              </p>
            )}
            {testCaseFields.map((field, index) => (
              <Card key={field.id} className="border-border">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Test Case {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`testCases.${index}.input`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Input</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Test case input"
                            className="min-h-[30px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`testCases.${index}.expectedOutput`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Output</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Expected output for this test case"
                            className="min-h-[30px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`testCases.${index}.isHidden`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Hidden test case</FormLabel>
                          <FormDescription>
                            Hidden test cases are not visible to users
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Problem
          </Button>
        </div>
      </form>
    </Form>
  );
}
