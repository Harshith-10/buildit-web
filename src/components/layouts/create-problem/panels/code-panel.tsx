"use client";

import { useState } from "react";
import type { Runtime } from "@/actions/code-execution";
import ProblemEditor from "@/components/layouts/problem/problem-editor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageName } from "@/lib/utils/languages";

interface CodePanelProps {
  driverCode: Record<string, string>;
  setDriverCode: (code: string, lang: string) => void;
  languages: Runtime[];
}

export default function CodePanel({
  driverCode,
  setDriverCode,
  languages,
}: CodePanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("java");

  // Get unique languages for selector
  const uniqueLanguages = Array.from(
    new Set(languages.map((l) => l.language)),
  ).sort();

  // If no languages loaded yet, provide defaults
  const displayLanguages =
    uniqueLanguages.length > 0
      ? uniqueLanguages
      : ["java", "python", "javascript", "typescript", "c++"];

  const currentCode = driverCode[selectedLanguage] || "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-2 bg-muted/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-muted-foreground text-sm">Driver Code</Label>
        </div>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {displayLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {getLanguageName(lang)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Editor - matches how problem-panes does it */}
      <ProblemEditor
        value={currentCode}
        onChange={(val) => setDriverCode(val, selectedLanguage)}
        language={selectedLanguage}
      />
    </div>
  );
}
