"use client";

import { format } from "date-fns";
import { ArrowRight, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageName } from "@/hooks/use-page-name";
import { useSession } from "@/lib/auth-client";
import { AddProblemsDialog } from "./add-problems-dialog";
import Link from "next/link";

interface Problem {
    id: string;
    type: string;
    difficulty: string;
    title: string;
    slug: string;
    createdAt: Date;
}

interface CollectionDetailsViewProps {
    collection: {
        id: string;
        name: string;
        description: string | null;
        problems: Problem[];
        totalProblems: number;
    };
}

export function CollectionDetailsView({ collection }: CollectionDetailsViewProps) {
    usePageName(collection.name);
    const session = useSession();
    const router = useRouter();

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
        {
            header: "Actions",
            accessorKey: (item: Problem) => (
                <Link href={`/problem/${item.slug}`} className="flex items-center">
                    <Button variant="ghost" size="icon">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            ),
            className: "w-[50px]",
        },
    ];

    return (
        <DataItemsView
            title={collection.name}
            description={collection.description || "Collection of coding problems."}
            data={collection.problems as any}
            totalItems={collection.totalProblems}
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
            headerAction={
                (session?.data?.user.role === "instructor" || session?.data?.user.role === "admin") && (
                    <AddProblemsDialog collectionId={collection.id} onAdded={() => router.refresh()} />
                )
            }
        />
    );
}
