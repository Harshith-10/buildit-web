"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { getUserSubmissions } from "@/actions/problem-data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Submission } from "@/types/problem";

export default function ProblemSubmissions({
  problemId,
}: {
  problemId: string;
}) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll for submissions? Or just fetch on mount.
  // User might submit and want to see it.
  // We can add a refresh trigger or just pool.
  const fetchSubmissions = async () => {
    try {
      const data = await getUserSubmissions(problemId);
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // Optional: Refresh periodically or listen to an event
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [problemId]);

  if (loading && submissions.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No submissions yet. Be the first to solve this!
      </div>
    );
  }

  return (
    <div className="p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell>
                <Badge
                  variant={
                    sub.status === "accepted"
                      ? "default" // or success if available
                      : sub.status === "wrong_answer"
                        ? "destructive"
                        : "outline"
                  }
                  className={
                    sub.status === "accepted"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {sub.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {sub.runtimeMs ? `${sub.runtimeMs}ms` : "-"}
              </TableCell>
              <TableCell>
                {sub.memoryKb ? `${(sub.memoryKb / 1024).toFixed(2)}MB` : "-"}
              </TableCell>
              <TableCell className="text-right text-muted-foreground text-sm">
                {format(new Date(sub.createdAt), "MMM d, HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
