"use client";

import { format } from "date-fns";
import { Calendar, CheckSquare, Globe, Loader2, Plus, Square, Type } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createCollection } from "@/actions/create-collection";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePageName } from "@/hooks/use-page-name";

interface Problem {
    id: string;
    type: string;
    difficulty: string;
    title: string;
    slug: string;
    description: string;
    createdAt: Date;
}

interface CreateCollectionWorkspaceProps {
    data: Problem[];
    total: number;
}

export function CreateCollectionWorkspace({
    data,
    total,
}: CreateCollectionWorkspaceProps) {
    usePageName("Create Collection");
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const handleCreate = async () => {
        if (!name) {
            toast.error("Please enter a collection name.");
            return;
        }
        setLoading(true);
        try {
            await createCollection({
                name,
                description: description || undefined,
                isPublic,
                problemIds: selectedIds,
            });
            toast.success("Collection created successfully!");
            router.push("/collections");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create collection");
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case "easy":
                return "text-green-500 bg-green-500/10 hover:bg-green-500/20";
            case "medium":
                return "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20";
            case "hard":
                return "text-red-500 bg-red-500/10 hover:bg-red-500/20";
            default:
                return "bg-secondary";
        }
    };

    const columns = [
        {
            header: "Select",
            accessorKey: (item: Problem) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSelection(item.id)}
                        className="h-8 w-8"
                    >
                        {selectedIds.includes(item.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                            <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                </div>
            ),
            className: "w-[50px]",
        },
        {
            header: "Title",
            accessorKey: "title" as keyof Problem,
            className: "font-medium",
        },
        {
            header: "Difficulty",
            accessorKey: (item: Problem) => (
                <Badge
                    variant="outline"
                    className={`border-0 ${getDifficultyColor(item.difficulty)}`}
                >
                    {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                </Badge>
            ),
        },
        {
            header: "Type",
            accessorKey: (item: Problem) => (
                <span className="capitalize">{item.type.replace("_", " ")}</span>
            ),
        },
        {
            header: "Created At",
            accessorKey: (item: Problem) => (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                </div>
            ),
        },
    ];

    return (
        <DataItemsView
            title="Create Collection"
            description={`Selected ${selectedIds.length} problems to group together.`}
            data={data as any}
            totalItems={total}
            columns={columns as any}
            defaultView="table"
            availableViews={["table"]}
            filters={[
                {
                    label: "Difficulty",
                    key: "difficulty",
                    options: [
                        { label: "Easy", value: "easy" },
                        { label: "Medium", value: "medium" },
                        { label: "Hard", value: "hard" },
                    ],
                },
                {
                    label: "Type",
                    key: "type",
                    options: [
                        { label: "Coding", value: "coding" },
                        { label: "MCQ (Single)", value: "mcq_single" },
                        { label: "MCQ (Multi)", value: "mcq_multi" },
                        { label: "True/False", value: "true_false" },
                        { label: "Descriptive", value: "descriptive" },
                    ],
                },
            ]}
            sortOptions={[
                { label: "Newest Created", value: "created-desc" },
                { label: "Title (A-Z)", value: "title-asc" },
                { label: "Difficulty (Asc)", value: "difficulty-asc" },
            ]}
            createAction={{
                label: "Create Collection",
                onClick: handleCreate,
                icon: loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="h-4 w-4" />
                ),
            }}
            extraHeader={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-none">
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2">
                            <Type className="h-3 w-3" />
                            Collection Name
                        </label>
                        <Input
                            placeholder="e.g. Microsoft SDE Track"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2">
                            <Type className="h-3 w-3" />
                            Description
                        </label>
                        <Textarea
                            placeholder="What is this collection about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[40px] h-10 py-2 resize-none bg-background/50 border-muted-foreground/20 focus:border-primary/50 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground/70 flex items-center gap-2">
                            <Globe className="h-3 w-3" />
                            Visibility
                        </label>
                        <div className="flex items-center gap-3 h-10 px-3 rounded-md border border-muted-foreground/20 bg-background/50 hover:bg-background/80 transition-all cursor-pointer group" onClick={() => setIsPublic(!isPublic)}>
                            <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isPublic ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                                {isPublic && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <span className="text-sm font-medium select-none text-foreground/90 group-hover:text-foreground transition-colors">
                                Public Collection
                            </span>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
