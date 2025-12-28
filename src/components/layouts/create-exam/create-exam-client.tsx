"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash2, Import, Users } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// User Interface
export interface User {
    id: string;
    rollNo: string;
    name: string;
    email: string;
    role: "student" | "instructor" | "admin";
    branch: string;
    semester: string;
}

// Schema Definition
const examFormSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters.",
    }),
    description: z.string().optional(),
    duration: z.number().min(5, {
        message: "Duration must be at least 5 minutes.",
    }),
    startTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Invalid start time",
    }),
    endTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Invalid end time",
    }),
    gradingStrategy: z.enum(["DIFFICULTY_BASED", "MANUAL_POINTS"]),
    // Difficulty Based Fields
    easyCount: z.number().min(0).optional(),
    mediumCount: z.number().min(0).optional(),
    hardCount: z.number().min(0).optional(),
    easyPoints: z.number().min(1).optional(),
    mediumPoints: z.number().min(1).optional(),
    hardPoints: z.number().min(1).optional(),
    // Manual Points Fields
    selectedProblems: z.array(z.string()).optional(),
    // Assignment Fields
    assignedTo: z.enum(["ALL", "BATCH", "INDIVIDUAL"]),
    targetBranch: z.string().optional(),
    targetSemester: z.string().optional(),
    targetStudents: z.array(z.string()).optional(),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

interface CreateExamClientProps {
    collections: any[]; // Replace with proper type if available
    problems: any[]; // Replace with proper type if available
    users: User[];
}

export default function CreateExamClient({
    collections,
    problems,
    users,
}: CreateExamClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examFormSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            gradingStrategy: "DIFFICULTY_BASED",
            easyCount: 1,
            mediumCount: 1,
            hardCount: 1,
            easyPoints: 10,
            mediumPoints: 20,
            hardPoints: 30,
            selectedProblems: [],
            assignedTo: "ALL",
            targetBranch: "all",
            targetSemester: "all",
            targetStudents: [],
            startTime: "",
            endTime: "",
        },
    });

    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    const gradingStrategy = form.watch("gradingStrategy");
    const assignedTo = form.watch("assignedTo");
    const selectedProblems = form.watch("selectedProblems") || [];

    const filteredProblems = problems.filter((problem) =>
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleImportCollection = () => {
        if (!selectedCollectionId) return;

        // Find problems belonging to this collection
        // Assuming problems have collectionId field (common pattern)
        // If not available in the prop type directly, logic might need adjustment based on real data
        const problemsInCollection = problems.filter(p => p.collectionId === selectedCollectionId);

        if (problemsInCollection.length === 0) {
            toast.error("No problems found in this collection or collection not linked.");
            return;
        }

        const currentSelected = form.getValues("selectedProblems") || [];
        const newSelected = [...currentSelected];

        problemsInCollection.forEach(p => {
            if (!newSelected.includes(p.id)) {
                newSelected.push(p.id);
            }
        });

        form.setValue("selectedProblems", newSelected);
        toast.success(`Imported ${problemsInCollection.length} problems from collection.`);
        setOpenImportDialog(false);
        setSelectedCollectionId("");
    };

    // Derived lists for filters
    const branches = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AI/ML", "DS", "CS", "AERO"];
    const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

    const students = users.filter(u => u.role === "student");

    async function onSubmit(data: ExamFormValues) {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log(data);
            toast.success("Exam created successfully!");
        } catch (error) {
            toast.error("Failed to create exam.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
                    <p className="text-muted-foreground mt-2">
                        Configure exam details, questions, and participants.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Exam"}
                    </Button>
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-8">
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8">
                            <TabsTrigger value="details">Exam Details</TabsTrigger>
                            <TabsTrigger value="questions">Questions & Grading</TabsTrigger>
                            <TabsTrigger value="participants">Participants</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Set the core details for this examination.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exam Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Mid-Term Examination 2024" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter exam instructions or description..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration (minutes)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="startTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Time</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="questions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Grading Strategy</CardTitle>
                                    <CardDescription>
                                        Choose how problems are selected and graded.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="gradingStrategy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Switch
                                                                checked={field.value === "MANUAL_POINTS"}
                                                                onCheckedChange={(checked) =>
                                                                    field.onChange(checked ? "MANUAL_POINTS" : "DIFFICULTY_BASED")
                                                                }
                                                            />
                                                            <span className="font-medium">
                                                                {field.value === "DIFFICULTY_BASED"
                                                                    ? "Difficulty-based Autogeneration"
                                                                    : "Manual Problem Selection"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {field.value === "DIFFICULTY_BASED"
                                                                ? "System randomly selects problems based on difficulty counts"
                                                                : "You explicitly choose which problems to include"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <AnimatePresence mode="wait">
                                {gradingStrategy === "DIFFICULTY_BASED" ? (
                                    <motion.div
                                        key="difficulty"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Difficulty Configuration</CardTitle>
                                                <CardDescription>
                                                    Configure the number of questions and points for each difficulty level.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-6">
                                                    {["easy", "medium", "hard"].map((difficulty) => (
                                                        <div
                                                            key={difficulty}
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end p-4 border rounded-lg"
                                                        >
                                                            <div className="space-y-4">
                                                                <h4 className="font-semibold capitalize flex items-center gap-2">
                                                                    <Badge
                                                                        variant={
                                                                            difficulty === "easy"
                                                                                ? "secondary"
                                                                                : difficulty === "medium"
                                                                                    ? "default"
                                                                                    : "destructive"
                                                                        }
                                                                    >
                                                                        {difficulty}
                                                                    </Badge>
                                                                    Questions
                                                                </h4>
                                                                <FormField
                                                                    control={form.control}
                                                                    // @ts-ignore
                                                                    name={`${difficulty}Count`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Count</FormLabel>
                                                                            <FormControl>
                                                                                <Input
                                                                                    type="number"
                                                                                    {...field}
                                                                                    onChange={(e) =>
                                                                                        field.onChange(parseInt(e.target.value))
                                                                                    }
                                                                                />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <FormField
                                                                control={form.control}
                                                                // @ts-ignore
                                                                name={`${difficulty}Points`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Points per Question</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="manual"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card className="h-[600px] flex flex-col">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>Select Problems</CardTitle>
                                                        <CardDescription>
                                                            Search and select specific problems for the exam.
                                                        </CardDescription>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Dialog open={openImportDialog} onOpenChange={setOpenImportDialog}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-2">
                                                                    <Import className="h-4 w-4" />
                                                                    Import from Collection
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Import Problems</DialogTitle>
                                                                    <DialogDescription>
                                                                        Select a collection to add its problems to this exam.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="py-4">
                                                                    <Select
                                                                        value={selectedCollectionId}
                                                                        onValueChange={setSelectedCollectionId}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a collection" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {collections?.map((collection) => (
                                                                                <SelectItem key={collection.id} value={collection.id}>
                                                                                    {collection.title}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button variant="outline" onClick={() => setOpenImportDialog(false)}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button onClick={handleImportCollection} disabled={!selectedCollectionId}>
                                                                        Import
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <Badge variant="secondary" className="px-4 py-1">
                                                            {selectedProblems.length} selected
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <Input
                                                        placeholder="Search problems..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 p-0">
                                                <ScrollArea className="h-full px-6 pb-6">
                                                    <div className="space-y-4">
                                                        {filteredProblems.map((problem) => (
                                                            <div
                                                                key={problem.id}
                                                                className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                                            >
                                                                <FormField
                                                                    control={form.control}
                                                                    name="selectedProblems"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(problem.id)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        const value = field.value || [];
                                                                                        if (checked) {
                                                                                            field.onChange([...value, problem.id]);
                                                                                        } else {
                                                                                            field.onChange(
                                                                                                value.filter((val) => val !== problem.id)
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <div className="space-y-1 block w-full">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <h4 className="font-semibold leading-none tracking-tight">
                                                                            {problem.title}
                                                                        </h4>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                problem.difficulty === "Easy"
                                                                                    ? "border-green-500 text-green-500"
                                                                                    : problem.difficulty === "Medium"
                                                                                        ? "border-yellow-500 text-yellow-500"
                                                                                        : "border-red-500 text-red-500"
                                                                            }
                                                                        >
                                                                            {problem.difficulty}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {problem.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {filteredProblems.length === 0 && (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                No problems found matching your search.
                                                            </div>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </TabsContent>

                        <TabsContent value="participants" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        <CardTitle>Exam Participants</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Who is this exam assigned to?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="assignedTo"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Assignment Type</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="ALL" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                All Students
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="BATCH" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Specific Branch/Semester
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="INDIVIDUAL" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Individual Students
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {assignedTo === "BATCH" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2">
                                            <FormField
                                                control={form.control}
                                                name="targetBranch"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Branch</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select branch" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Branches</SelectItem>
                                                                {branches.map((b) => (
                                                                    <SelectItem key={b} value={b}>
                                                                        {b}
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
                                                name="targetSemester"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Semester</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select semester" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Semesters</SelectItem>
                                                                {semesters.map((s) => (
                                                                    <SelectItem key={s} value={s}>
                                                                        Semester {s}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {assignedTo === "INDIVIDUAL" && (
                                        <div className="pl-6 border-l-2 space-y-4">
                                            <FormLabel>Select Students</FormLabel>
                                            <div className="border rounded-md">
                                                <ScrollArea className="h-[300px] p-4">
                                                    <div className="space-y-2">
                                                        {users?.map((student) => (
                                                            <FormField
                                                                key={student.id}
                                                                control={form.control}
                                                                name="targetStudents"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-sm">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(student.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const value = field.value || [];
                                                                                    if (checked) {
                                                                                        field.onChange([...value, student.id]);
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            value.filter((val) => val !== student.id)
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <div className="space-y-1 leading-none">
                                                                            <FormLabel className="font-normal">
                                                                                {student.name} ({student.rollNo})
                                                                            </FormLabel>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {student.branch} - Sem {student.semester}
                                                                            </p>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Selected: {form.watch("targetStudents")?.length || 0} students
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </Form>
        </div>
    );
}
