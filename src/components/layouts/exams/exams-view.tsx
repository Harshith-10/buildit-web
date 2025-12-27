"use client";

import { format } from "date-fns";
import { Calendar, Clock, Info, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { GetExamsParams } from "@/actions/exams-list";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePageName } from "@/hooks/use-page-name";
import { useSession } from "@/lib/auth-client";

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
  error?: string | null;
  terminationDetails?: any;
}

export function ExamsView({
  data,
  total,
  error,
  terminationDetails,
}: ExamsViewProps) {
  usePageName("Exams");
  const session = useSession();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

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
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                <Link href={`/exams/${item.id}`}>
                  <Info className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Details</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary"
              >
                <Link href={`/exam/${item.id}`}>
                  <Play className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start Exam</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      className: "w-[100px]",
    },
  ];

  const renderCard = (item: Exam) => (
    <div className="flex flex-col h-full border rounded-xl p-6 hover:border-primary/50 transition-colors bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
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

      <div className="mt-auto pt-4 border-t w-full grid grid-cols-2 gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/exams/${item.id}`}>View Details</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href={`/exam/${item.id}`}>Start Exam</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DataItemsView
        title="Exams"
        description="Manage and view all exams."
        data={data}
        totalItems={total}
        columns={columns}
        renderCard={renderCard}
        defaultView="card"
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

      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {error === "exam_terminated" ? "Exam Terminated" : "Error"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {error === "invalid_session" ? (
                "The exam session is invalid or has expired."
              ) : error === "exam_terminated" ? (
                <div className="space-y-4">
                  <p>
                    The exam has been terminated due to security violations.
                  </p>
                  {terminationDetails && (
                    <div className="bg-muted p-4 rounded-md text-sm">
                      <p className="font-semibold mb-2"> violation Log:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {terminationDetails.events?.map(
                          (event: any, i: number) => (
                            <li key={i}>
                              <span className="font-medium">
                                {event.type === "fullscreen_exit"
                                  ? "Exited Fullscreen"
                                  : event.type === "tab_switch"
                                    ? "Switched Tab"
                                    : event.type}
                              </span>{" "}
                              <span className="text-muted-foreground text-xs">
                                at {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </li>
                          ),
                        )}
                      </ul>
                      <p className="mt-2 font-semibold text-destructive">
                        Total Violations: {terminationDetails.violationCount}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                "An unexpected error occurred."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowError(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
