"use client";

import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateProblemHeaderProps {
  title: string;
  setTitle: (t: string) => void;
  onCreate: () => void;
  loading: boolean;
}

export default function CreateProblemHeader({
  title,
  setTitle,
  onCreate,
  loading,
}: CreateProblemHeaderProps) {
  return (
    <header className="flex items-center justify-between p-2 border-b bg-background">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/problems">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Input
            placeholder="Problem Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 font-semibold"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onCreate} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Create Problem
        </Button>
      </div>
    </header>
  );
}
