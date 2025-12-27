"use client";

import { format } from "date-fns";
import { Calendar, CheckSquare, Plus, Square } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { addProblemsToCollection } from "@/actions/add-problems-to-collection";
import { getProblems } from "@/actions/problems-list";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Problem {
    id: string;
    type: string;
    difficulty: string;
    title: string;
    slug: string;
    createdAt: string | Date;
}

interface AddProblemsDialogProps {
    collectionId: string;
    onAdded?: () => void;
}

export function AddProblemsDialog({
    collectionId,
    onAdded,
}: AddProblemsDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Search/Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    // Debounce searchTerm
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search change
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchProblems = async () => {
        setLoading(true);
        try {
            const { data, total } = await getProblems({
                page,
                search: debouncedSearch || undefined,
                perPage: 10,
            });
            setProblems(data as any);
            setTotal(total);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch problems");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchProblems();
        }
    }, [open, page, debouncedSearch]);

    const handleAdd = () => {
        if (selectedIds.length === 0) {
            toast.error("Please select at least one problem");
            return;
        }

        startTransition(async () => {
            try {
                await addProblemsToCollection({
                    collectionId,
                    problemIds: selectedIds,
                });
                toast.success("Problems added successfully");
                setOpen(false);
                setSelectedIds([]);
                onAdded?.();
            } catch (error: any) {
                toast.error(error.message || "Failed to add problems");
            }
        });
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const renderDifficultyBadge = (diff: string) => {
        let color = "bg-secondary";
        if (diff === "easy") color = "text-green-500 bg-green-500/10";
        if (diff === "medium") color = "text-yellow-500 bg-yellow-500/10";
        if (diff === "hard") color = "text-red-500 bg-red-500/10";

        return (
            <Badge variant="outline" className={`border-0 ${color}`}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </Badge>
        );
    };

    const columns = [
        {
            header: "Select",
            className: "w-[50px]",
        },
        {
            header: "Title",
            className: "font-medium",
        },
        {
            header: "Difficulty",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add More Questions
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Add Problems to Collection</DialogTitle>
                    <DialogDescription>
                        Search and select problems to add to this collection.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto px-6 py-4">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search problems..."
                            className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                    </div>

                    <div className="border rounded-md">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    {columns.map((col, i) => (
                                        <th
                                            key={i}
                                            className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground ${col.className}`}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="h-24 text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : problems.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="h-24 text-center">
                                            No problems found.
                                        </td>
                                    </tr>
                                ) : (
                                    problems.map((prob) => (
                                        <tr key={prob.id} className="border-b last:border-0">
                                            <td className="p-4 align-middle">
                                                <div className="flex justify-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleSelection(prob.id)}
                                                        className="h-8 w-8"
                                                    >
                                                        {selectedIds.includes(prob.id) ? (
                                                            <CheckSquare className="h-4 w-4 text-primary" />
                                                        ) : (
                                                            <Square className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                {prob.title}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {renderDifficultyBadge(prob.difficulty)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {total > 10 && (
                        <div className="flex items-center justify-between py-4">
                            <span className="text-sm text-muted-foreground">
                                Showing {problems.length} of {total} problems
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page * 10 >= total}
                                    onClick={() => setPage(page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-2 border-t bg-muted/20">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={isPending || selectedIds.length === 0}
                        className="min-w-[120px]"
                    >
                        {isPending ? "Adding..." : `Add ${selectedIds.length} Problems`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
