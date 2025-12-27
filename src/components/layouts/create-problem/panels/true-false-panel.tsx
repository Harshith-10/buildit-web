"use client";

import { Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TrueFalsePanelProps {
  correctAnswer: boolean | null;
  setCorrectAnswer: (answer: boolean | null) => void;
}

export default function TrueFalsePanel({
  correctAnswer,
  setCorrectAnswer,
}: TrueFalsePanelProps) {
  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-sm">Correct Answer</h3>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setCorrectAnswer(true)}
            className={cn(
              "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all cursor-pointer",
              correctAnswer === true
                ? "border-green-500 bg-green-500/10 text-green-600"
                : "border-border hover:border-green-300 hover:bg-green-500/5",
            )}
          >
            <Check className="h-12 w-12" />
            <span className="font-semibold text-lg">True</span>
          </button>

          <button
            type="button"
            onClick={() => setCorrectAnswer(false)}
            className={cn(
              "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all cursor-pointer",
              correctAnswer === false
                ? "border-red-500 bg-red-500/10 text-red-600"
                : "border-border hover:border-red-300 hover:bg-red-500/5",
            )}
          >
            <X className="h-12 w-12" />
            <span className="font-semibold text-lg">False</span>
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center border-t pt-2">
        Select the correct answer for this True/False question
      </div>
    </div>
  );
}
