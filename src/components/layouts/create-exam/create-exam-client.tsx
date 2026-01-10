"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash2, Import, Users } from "lucide-react";
import { createExam } from "@/actions/create-exam";
import type { ExamConfig } from "@/types/exam-config";

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

export interface Group {
    id: string;
    name: string;
    description: string | null;
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
    gradingStrategy: z.enum([
        "standard_20_40_50",
        "linear",
        "difficulty_based",
        "count_based"
    ]),
    // Linear Strategy Fields
    linearMarks: z.number().min(1).optional(),
    // Difficulty Based Fields
    easyCount: z.number().min(0).optional(),
    mediumCount: z.number().min(0).optional(),
    hardCount: z.number().min(0).optional(),
    easyPoints: z.number().min(1).optional(),
    mediumPoints: z.number().min(1).optional(),
    hardPoints: z.number().min(1).optional(),
    // Count Based Fields
    countBasedRules: z.array(z.object({
        count: z.number().min(0),
        marks: z.number().min(0)
    })).optional(),
    // Partial Grading
    enablePartialPoints: z.boolean().optional(),
    // Manual Points Fields
    selectedProblems: z.array(z.string()).optional(),
    // Assignment Fields
    assignedTo: z.enum(["ALL", "BATCH", "INDIVIDUAL", "GROUPS"]),
    targetBranch: z.string().optional(),
    targetSemester: z.string().optional(),
    targetStudents: z.array(z.string()).optional(),
    selectedGroups: z.array(z.string()).optional(),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

interface CreateExamClientProps {
    collections: any[]; // Replace with proper type if available
    problems: any[]; // Replace with proper type if available
    users: User[];
    groups: Group[];
}

export default function CreateExamClient({
    collections,
    problems,
    users,
    groups,
}: CreateExamClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examFormSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            gradingStrategy: "standard_20_40_50",
            linearMarks: 10,
            easyCount: 1,
            mediumCount: 1,
            hardCount: 1,
            easyPoints: 20,
            mediumPoints: 40,
            hardPoints: 50,
            countBasedRules: [
                { count: 5, marks: 100 },
                { count: 3, marks: 70 },
                { count: 1, marks: 40 }
            ],
            enablePartialPoints: true,
            selectedProblems: [],
            assignedTo: "GROUPS",
            targetBranch: "all",
            targetSemester: "all",
            targetStudents: [],
            selectedGroups: [],
            startTime: "",
            endTime: "",
        },
    });

    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 3;

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
            // Build the ExamConfig based on the selected problems
            const config: ExamConfig = {
                strategy: "fixed",
                problemIds: data.selectedProblems || []
            };

            // Determine which groups should have access based on assignedTo
            let groupIds: string[] = [];
            
            if (data.assignedTo === "ALL") {
                // All students: assign all groups
                groupIds = groups.map(g => g.id);
            } else if (data.assignedTo === "GROUPS") {
                // Specific groups: use selected groups
                if (!data.selectedGroups || data.selectedGroups.length === 0) {
                    toast.error("Please select at least one group.");
                    setIsLoading(false);
                    return;
                }
                groupIds = data.selectedGroups;
            } else if (data.assignedTo === "BATCH") {
                // TODO: Filter groups based on branch/semester
                // For now, this needs proper implementation
                toast.error("BATCH assignment is not yet fully implemented.");
                setIsLoading(false);
                return;
            } else if (data.assignedTo === "INDIVIDUAL") {
                // TODO: Create individual assignments
                // For now, this needs proper implementation
                toast.error("INDIVIDUAL assignment is not yet fully implemented.");
                setIsLoading(false);
                return;
            }

            const result = await createExam({
                title: data.title,
                startTime: new Date(data.startTime),
                groupIds: groupIds,
                endTime: new Date(data.endTime),
                durationMinutes: data.duration,
                config
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Exam created successfully!");
                setTimeout(() => router.push("/exams"), 0);
            }
        } catch (error) {
            console.error("Error creating exam:", error);
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
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
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
                                        Choose how student submissions are scored.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="gradingStrategy"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Scoring Method</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grading strategy" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="standard_20_40_50">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">Standard (20/40/50)</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Easy=20, Medium=40, Hard=50 points
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="linear">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">Linear</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Equal points per question
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="difficulty_based">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">Difficulty-Based</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Custom points per difficulty level
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="count_based">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">Count-Based</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Threshold-based scoring
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    {field.value === "standard_20_40_50" && 
                                                        "Predefined scoring: Easy questions worth 20 points, Medium worth 40, Hard worth 50."}
                                                    {field.value === "linear" && 
                                                        "All questions worth the same points regardless of difficulty."}
                                                    {field.value === "difficulty_based" && 
                                                        "Customize points for each difficulty level."}
                                                    {field.value === "count_based" && 
                                                        "Award marks based on the number of questions solved."}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="enablePartialPoints"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">
                                                        Partial Credit
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Award points based on test cases passed (not just fully correct solutions)
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <AnimatePresence mode="wait">
                                {gradingStrategy === "linear" && (
                                    <motion.div
                                        key="linear"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Linear Scoring Configuration</CardTitle>
                                                <CardDescription>
                                                    Set the points awarded for each question.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <FormField
                                                    control={form.control}
                                                    name="linearMarks"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Points per Question</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(parseInt(e.target.value))
                                                                    }
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Each question will be worth this many points
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {gradingStrategy === "difficulty_based" && (
                                    <motion.div
                                        key="difficulty"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Difficulty-Based Scoring</CardTitle>
                                                <CardDescription>
                                                    Configure points for each difficulty level.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-6">
                                                    {["easy", "medium", "hard"].map((difficulty) => (
                                                        <div
                                                            key={difficulty}
                                                            className="flex items-center gap-4 p-4 border rounded-lg"
                                                        >
                                                            <Badge
                                                                variant={
                                                                    difficulty === "easy"
                                                                        ? "secondary"
                                                                        : difficulty === "medium"
                                                                            ? "default"
                                                                            : "destructive"
                                                                }
                                                                className="min-w-[80px] justify-center"
                                                            >
                                                                {difficulty}
                                                            </Badge>
                                                            <FormField
                                                                control={form.control}
                                                                // @ts-ignore
                                                                name={`${difficulty}Points`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                        <FormLabel>Points</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                value={field.value as number}
                                                                                onChange={(e) =>
                                                                                    field.onChange(parseInt(e.target.value))
                                                                                }
                                                                                onBlur={field.onBlur}
                                                                                name={field.name}
                                                                                ref={field.ref}
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
                                )}

                                {gradingStrategy === "count_based" && (
                                    <motion.div
                                        key="count"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Count-Based Scoring Rules</CardTitle>
                                                <CardDescription>
                                                    Define thresholds: solving X questions awards Y marks.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                                                        <div>Questions Solved</div>
                                                        <div>Marks Awarded</div>
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name="countBasedRules"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <div className="space-y-3">
                                                                    {(field.value || []).map((rule, index) => (
                                                                        <div key={index} className="grid grid-cols-2 gap-4 items-center">
                                                                            <Input
                                                                                type="number"
                                                                                value={rule.count}
                                                                                onChange={(e) => {
                                                                                    const newRules = [...(field.value || [])];
                                                                                    newRules[index] = {
                                                                                        ...rule,
                                                                                        count: parseInt(e.target.value) || 0
                                                                                    };
                                                                                    field.onChange(newRules);
                                                                                }}
                                                                                placeholder="e.g., 5"
                                                                            />
                                                                            <div className="flex gap-2">
                                                                                <Input
                                                                                    type="number"
                                                                                    value={rule.marks}
                                                                                    onChange={(e) => {
                                                                                        const newRules = [...(field.value || [])];
                                                                                        newRules[index] = {
                                                                                            ...rule,
                                                                                            marks: parseInt(e.target.value) || 0
                                                                                        };
                                                                                        field.onChange(newRules);
                                                                                    }}
                                                                                    placeholder="e.g., 100"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    onClick={() => {
                                                                                        const newRules = (field.value || []).filter((_, i) => i !== index);
                                                                                        field.onChange(newRules);
                                                                                    }}
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            field.onChange([...(field.value || []), { count: 0, marks: 0 }]);
                                                                        }}
                                                                        className="w-full"
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Add Rule
                                                                    </Button>
                                                                </div>
                                                                <FormDescription>
                                                                    Example: If student solves ≥5 questions, they get 100 marks
                                                                </FormDescription>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Problem Selection</CardTitle>
                                    <CardDescription>
                                        Choose problems for this exam.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <motion.div
                                        key="manual"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        {/* Fixed container with proper overflow handling */}
                                        <Card className="max-h-[600px] flex flex-col overflow-hidden">
                                            <CardHeader className="pb-4 border-b">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle>Select Problems</CardTitle>
                                                        <CardDescription className="truncate">
                                                            Search and select specific problems for the exam.
                                                        </CardDescription>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Dialog open={openImportDialog} onOpenChange={setOpenImportDialog}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
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
                                                                                    {collection.name}
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
                                                        <Badge variant="secondary" className="px-4 py-1 whitespace-nowrap">
                                                            {selectedProblems.length} selected
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <Input
                                                        placeholder="Search problems..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 p-0 overflow-hidden">
                                                <ScrollArea className="h-[400px] w-full">
                                                    <div className="space-y-3 p-4">
                                                        {filteredProblems.map((problem) => (
                                                            <div
                                                                key={problem.id}
                                                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors overflow-hidden"
                                                            >
                                                                <FormField
                                                                    control={form.control}
                                                                    name="selectedProblems"
                                                                    render={({ field }) => (
                                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-1 flex-shrink-0">
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
                                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="font-semibold leading-none tracking-tight truncate">
                                                                                {problem.title}
                                                                            </h4>
                                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                                                                                {problem.description}
                                                                            </p>
                                                                        </div>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={
                                                                                problem.difficulty === "Easy"
                                                                                    ? "border-green-500 text-green-500 flex-shrink-0"
                                                                                    : problem.difficulty === "Medium"
                                                                                        ? "border-yellow-500 text-yellow-500 flex-shrink-0"
                                                                                        : "border-red-500 text-red-500 flex-shrink-0"
                                                                            }
                                                                        >
                                                                            {problem.difficulty}
                                                                        </Badge>
                                                                    </div>
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
                                </CardContent>
                            </Card>
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
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="GROUPS" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                Student Groups
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {assignedTo === "GROUPS" && (
                                        <div className="pl-6 border-l-2 space-y-4">
                                            <FormLabel>Select Groups</FormLabel>
                                            <div className="border rounded-md overflow-hidden">
                                                <ScrollArea className="h-[200px]">
                                                    <div className="p-4 space-y-2">
                                                        {groups.map((group) => (
                                                            <FormField
                                                                key={group.id}
                                                                control={form.control}
                                                                name="selectedGroups"
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 hover:bg-muted/50 rounded-sm">
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(group.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    const value = field.value || [];
                                                                                    if (checked) {
                                                                                        field.onChange([...value, group.id]);
                                                                                    } else {
                                                                                        field.onChange(
                                                                                            value.filter((val) => val !== group.id)
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <div className="space-y-1 leading-none min-w-0">
                                                                            <FormLabel className="font-normal font-medium truncate block">
                                                                                {group.name}
                                                                            </FormLabel>
                                                                            {group.description && (
                                                                                <p className="text-xs text-muted-foreground truncate">
                                                                                    {group.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Selected {form.watch("selectedGroups")?.length || 0} of {groups.length} groups
                                            </p>
                                        </div>
                                    )}

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
                                            <div className="border rounded-md overflow-hidden">
                                                <ScrollArea className="h-[300px]">
                                                    <div className="p-4 space-y-2">
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
                                                                        <div className="space-y-1 leading-none min-w-0">
                                                                            <FormLabel className="font-normal truncate block">
                                                                                {student.name} ({student.rollNo})
                                                                            </FormLabel>
                                                                            <p className="text-xs text-muted-foreground truncate">
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