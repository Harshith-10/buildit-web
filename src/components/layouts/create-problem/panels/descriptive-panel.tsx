"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DescriptivePanelProps {
  sampleAnswer: string;
  setSampleAnswer: (answer: string) => void;
}

export default function DescriptivePanel({
  sampleAnswer,
  setSampleAnswer,
}: DescriptivePanelProps) {
  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-sm">
          Sample Answer / Grading Rubric
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <Label className="text-muted-foreground text-xs">
          Provide a sample answer or grading guidelines for manual review
        </Label>
        <Textarea
          className="flex-1 resize-none font-mono text-sm"
          placeholder="Enter sample answer or grading rubric..."
          value={sampleAnswer}
          onChange={(e) => setSampleAnswer(e.target.value)}
        />
      </div>

      <div className="text-xs text-muted-foreground border-t pt-2">
        This will be used as a reference for grading descriptive answers
      </div>
    </div>
  );
}
