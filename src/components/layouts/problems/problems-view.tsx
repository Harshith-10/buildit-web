"use client";

import { format } from "date-fns";
import { Calendar, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageName } from "@/hooks/use-page-name";
import { useSession } from "@/lib/auth-client";

interface Problem {
  id: string;
  type: string;
  difficulty: string;
  title: string;
  description: string;
  content: unknown;
  gradingMetadata: unknown;
  public: boolean | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProblemsViewProps {
  data: Problem[];
  total: number;
}

export function ProblemsView({ data, total }: ProblemsViewProps) {
  usePageName("Problems");
  const session = useSession();

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
          <span>{format(item.createdAt, "MMM d, yyyy")}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: (item: Problem) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/problems/${item.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <DataItemsView
      title="Problems"
      description="Manage and view coding problems."
      data={data}
      totalItems={total}
      columns={columns}
      // renderCard is omitted or undefined because we disable card view
      defaultView="table"
      availableViews={["table"]} // Cards disabled as requested
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
      createAction={
        session?.data?.user.role === "instructor" ||
        session?.data?.user.role === "admin"
          ? {
              label: "New Problem",
              onClick: () => {
                window.location.href = "/problems/create";
              },
            }
          : undefined
      }
    />
  );
}
