"use client";

import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { foldEffect } from "@codemirror/language";
import { duotoneDark, duotoneLight } from "@uiw/codemirror-theme-duotone";
import CodeMirror, {
  type Extension,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { Loader, Play, Send, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { Runtime } from "@/actions/code-execution";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageName } from "@/lib/languages";

interface ProblemEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
}

export default function ProblemEditor({
  value,
  onChange,
  language,
}: ProblemEditorProps) {
  const { theme } = useTheme();
  // Ensure we mount only after hydration to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Language extension mapping
  const extensions = useMemo(() => {
    const exts: Extension[] = [];
    if (language === "javascript" || language === "typescript") {
      exts.push(javascript({ jsx: true, typescript: true }));
    } else if (language === "python") {
      exts.push(python());
    } else if (language === "java") {
      exts.push(java());
    }
    return exts;
  }, [language]);

  // Folding logic
  // Ref to track if we have folded for the current language session
  const hasFoldedRef = useRef(false);
  const lastLanguageRef = useRef(language);

  // Reset fold state when language changes
  useEffect(() => {
    if (language !== lastLanguageRef.current) {
      hasFoldedRef.current = false;
      lastLanguageRef.current = language;
    }
  }, [language]);

  // Folding logic
  useEffect(() => {
    if (!editorRef.current || !mounted) return;

    // Use a timeout to ensure editor view is ready and to debounce
    const timer = setTimeout(() => {
      const view = editorRef.current?.view;
      if (!view) return;

      // If already folded for this session, skip
      if (hasFoldedRef.current) return;

      const lines = value.split("\n");
      const foldRanges: { from: number; to: number }[] = [];
      let startLine = -1;
      let _foundRegion = false;

      lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Check for start markers
        if (
          trimmed.includes("# region boilerplate") ||
          trimmed.includes("// region boilerplate")
        ) {
          startLine = index;
        }

        // Check for end markers
        if (
          startLine !== -1 &&
          (trimmed.includes("# endregion") || trimmed.includes("// endregion"))
        ) {
          // Determine range
          const from = view.state.doc.line(startLine + 1).to;
          const to = view.state.doc.line(index + 1).to;
          foldRanges.push({ from, to });
          startLine = -1;
          _foundRegion = true;
        }
      });

      // Apply folds if regions found
      if (foldRanges.length > 0) {
        view.dispatch({
          effects: foldRanges.map(({ from, to }) =>
            foldEffect.of({ from, to }),
          ),
        });
        // Mark as folded so we don't annoy user on subsequent edits
        hasFoldedRef.current = true;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [value, mounted]); // added value back, guarded by hasFoldedRef

  if (!mounted) return null;

  return (
    <div className="flex-1 flex w-full overflow-hidden bg-background">
      <CodeMirror
        ref={editorRef}
        className="flex-1 text-base"
        value={value}
        height="100%"
        extensions={extensions}
        onChange={onChange}
        theme={theme === "light" ? duotoneLight : duotoneDark}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          drawSelection: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}

interface ProblemEditorHeaderProps {
  language: string;
  version: string;
  onLanguageChange: (lang: string) => void;
  onVersionChange: (ver: string) => void;
  languages?: Runtime[];
  onRun?: () => Promise<void>;
  isExecuting?: boolean;
}

export function ProblemEditorHeader({
  language,
  version,
  onLanguageChange,
  onVersionChange,
  languages,
  onRun,
  isExecuting,
}: ProblemEditorHeaderProps) {
  // Rate limiting ref
  const lastExecutionTime = useRef<number>(0);

  // Get unique languages
  const uniqueLanguages = useMemo(() => {
    if (!languages) return [];
    const langs = new Set<string>();
    languages.forEach((l) => {
      langs.add(l.language);
    });
    return Array.from(langs).sort();
  }, [languages]);

  // Get versions for selected language
  const versions = useMemo(() => {
    if (!languages || !language) return [];
    return languages
      .filter((l) => l.language === language)
      .map((l) => l.version)
      .sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }),
      ); // Descending order
  }, [languages, language]);

  const handleRunClick = async () => {
    if (!onRun) return;

    const now = Date.now();
    if (now - lastExecutionTime.current < 5000) {
      toast.error("Please wait 5 seconds before running again.");
      return;
    }

    lastExecutionTime.current = now;
    await onRun();
  };

  return (
    <div className="w-full items-center justify-between flex gap-2 p-2 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="min-w-[120px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {uniqueLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {getLanguageName(lang)}
              </SelectItem>
            ))}
            {!languages && (
              <>
                <SelectItem value="java">java</SelectItem>
                <SelectItem value="python">python</SelectItem>
                <SelectItem value="typescript">typescript</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        <Select
          value={version}
          onValueChange={onVersionChange}
          disabled={!language}
        >
          <SelectTrigger className="min-w-[100px]">
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((ver) => (
              <SelectItem key={ver} value={ver}>
                {ver}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <ButtonGroup>
          <Button
            size="sm"
            variant="outline"
            className="w-fit"
            onClick={handleRunClick}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </Button>
          <Button
            size="sm"
            className="w-fit bg-green-600 text-white hover:bg-green-700"
            onClick={handleRunClick}
            disabled={isExecuting}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </ButtonGroup>
        <Button variant="ghost" className="px-2">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
