"use client";

import { format } from "date-fns";
import { Calendar, Clock, Eye, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { GetExamsParams } from "@/actions/exams-list";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import { useSession } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePageName } from "@/hooks/use-page-name";

interface Exam {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  config: unknown;
  createdBy: string;
  createdAt: Date | null;
  updatedAt: Date;
}

interface ExamsViewProps {
  data: Exam[];
  total: number;
  initialParams?: GetExamsParams;
}

export function ExamsView({ data, total }: ExamsViewProps) {
  usePageName("Exams");
  const session = useSession();

  // Helper for Status Badge
  const getStatus = (start: Date, end: Date) => {
    const now = new Date();
    if (now < start)
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Upcoming
        </Badge>
      );
    if (now > end) return <Badge variant="secondary">Completed</Badge>;
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Ongoing
      </Badge>
    );
  };

  const columns = [
    {
      header: "Title",
      accessorKey: "title" as keyof Exam,
      className: "font-medium",
    },
    {
      header: "Status",
      accessorKey: (item: Exam) => getStatus(item.startTime, item.endTime),
    },
    {
      header: "Start Time",
      accessorKey: (item: Exam) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(item.startTime, "MMM d, yyyy h:mm a")}</span>
        </div>
      ),
    },
    {
      header: "Duration",
      accessorKey: (item: Exam) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{item.durationMinutes} mins</span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: (item: Exam) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/exams/${item.id}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  const renderCard = (item: Exam) => (
    <div className="flex flex-col h-full border rounded-xl p-6 hover:border-primary/50 transition-colors bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          {/* Placeholder Icon or actual icon if available */}
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        {getStatus(item.startTime, item.endTime)}
      </div>

      <h3 className="text-xl font-bold mb-2 line-clamp-1">{item.title}</h3>

      <div className="space-y-2 text-sm text-muted-foreground flex-1 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(item.startTime, "MMM d, h:mm a")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{item.durationMinutes} minutes</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t w-full">
        <Button asChild className="w-full gap-2">
          <Link href={`/exams/${item.id}`}>View Exam</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <DataItemsView
      title="Exams"
      description="Manage and view all exams."
      data={data}
      totalItems={total}
      columns={columns}
      renderCard={renderCard}
      defaultView="table"
      availableViews={["card", "table"]}
      filters={[
        {
          label: "Status",
          key: "status",
          options: [
            { label: "Upcoming", value: "upcoming" },
            { label: "Ongoing", value: "ongoing" },
            { label: "Completed", value: "completed" },
          ],
        },
      ]}
      sortOptions={[
        { label: "Newest Created", value: "created-desc" }, // Default logic in server action handles null, but we can match
        { label: "Date (Ascending)", value: "date-asc" },
        { label: "Date (Descending)", value: "date-desc" },
        { label: "Title (A-Z)", value: "title-asc" },
      ]}
      createAction={
        session?.data?.user.role === "instructor" ||
        session?.data?.user.role === "admin"
          ? {
              label: "Create Exam",
              onClick: () => {
                // This should probably navigate to a create page or open a modal.
                // For now, let's assume navigation.
                window.location.href = "/exams/create";
              },
            }
          : undefined
      }
    />
  );
}
