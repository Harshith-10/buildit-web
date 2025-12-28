"use client";

import { format } from "date-fns";
import { AlertCircle, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSubmission } from "@/actions/submissions-list";
import { DataItemsView } from "@/components/common/data-items/data-items-root";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageName } from "@/hooks/use-page-name";

interface Submission {
  id: string;
  sessionId: string;
  examId: string;
  examTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  startedAt: Date | null;
  terminationReason: string | null;
  submissionCount: number;
}

interface SubmissionsViewProps {
  data: Submission[];
  total: number;
}

export function SubmissionsView({ data, total }: SubmissionsViewProps) {
  usePageName("Submissions");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (sessionId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteSubmission(sessionId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Submission deleted successfully");
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to delete submission");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "text-green-500 bg-green-500/10 hover:bg-green-500/20";
      case "terminated":
        return "text-red-500 bg-red-500/10 hover:bg-red-500/20";
      case "in_progress":
        return "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20";
      default:
        return "bg-secondary";
    }
  };

  const columns = [
    {
      header: "Student",
      accessorKey: (item: Submission) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.userName}</span>
          <span className="text-xs text-muted-foreground">{item.userEmail}</span>
        </div>
      ),
    },
    {
      header: "Exam",
      accessorKey: (item: Submission) => (
        <span className="font-medium">{item.examTitle}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: (item: Submission) => (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`border-0 ${getStatusColor(item.status)}`}
          >
            {item.status === "terminated" ? "Terminated" : "Submitted"}
          </Badge>
          {item.status === "terminated" && item.terminationReason && (
            <div className="group relative">
              <AlertCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-48 p-2 text-xs bg-popover text-popover-foreground border rounded-md shadow-md">
                {item.terminationReason}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Submissions",
      accessorKey: (item: Submission) => (
        <span className="text-muted-foreground">{item.submissionCount}</span>
      ),
      className: "text-center",
    },
    {
      header: "Started At",
      accessorKey: (item: Submission) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {item.startedAt 
              ? format(new Date(item.startedAt), "MMM d, yyyy HH:mm")
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: (item: Submission) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeletingId(item.sessionId)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <>
      <DataItemsView
        title="Exam Submissions"
        description="View and manage student exam submissions and attempts."
        data={data}
        totalItems={total}
        columns={columns}
        defaultView="table"
        availableViews={["table"]}
        filters={[
          {
            label: "Status",
            key: "status",
            options: [
              { label: "All", value: "all" },
              { label: "Submitted", value: "submitted" },
              { label: "Terminated", value: "terminated" },
            ],
          },
        ]}
        sortOptions={[
          { label: "Most Recent", value: "created-desc" },
          { label: "Oldest First", value: "created-asc" },
          { label: "Name (A-Z)", value: "name-asc" },
          { label: "Name (Z-A)", value: "name-desc" },
        ]}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This will remove
              all associated data including the exam session and all problem
              submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
