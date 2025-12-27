"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface MetadataPanelProps {
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (d: "easy" | "medium" | "hard") => void;
  type: "coding" | "mcq" | "true_false" | "descriptive";
  setType: (t: "coding" | "mcq" | "true_false" | "descriptive") => void;
  isPublic: boolean;
  setIsPublic: (p: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function MetadataPanel({
  difficulty,
  setDifficulty,
  type,
  setType,
  isPublic,
  setIsPublic,
  tags,
  setTags,
}: MetadataPanelProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const typeLabels: Record<string, string> = {
    coding: "Coding",
    mcq: "MCQ",
    true_false: "True/False",
    descriptive: "Descriptive",
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background overflow-y-auto">
      <h3 className="font-semibold text-sm border-b pb-2">Metadata</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Problem Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(typeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="public-switch">Make Public</Label>
        <Switch
          id="public-switch"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tags</Label>
        <Input
          placeholder="Type and press Enter to add tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
        />
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
