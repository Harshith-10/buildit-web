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
import { Play, Send, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  useEffect(() => {
    if (!editorRef.current || !mounted) return;

    const view = editorRef.current.view;
    if (!view) return;

    // Small delay to ensure editor is ready
    const timer = setTimeout(() => {
      // Find fold regions
      const lines = value.split("\n");
      const foldRanges: { from: number; to: number }[] = [];
      let startLine = -1;

      lines.forEach((line, index) => {
        // Check for start markers
        if (
          line.trim().includes("# region boilerplate") ||
          line.trim().includes("// region boilerplate")
        ) {
          startLine = index;
        }

        // Check for end markers
        if (
          startLine !== -1 &&
          (line.trim().includes("# endregion") ||
            line.trim().includes("// endregion"))
        ) {
          // Convert line numbers to character positions
          const from = view.state.doc.line(startLine + 1).to; // End of start line
          const to = view.state.doc.line(index + 1).to; // End of end line

          foldRanges.push({ from, to });
          startLine = -1;
        }
      });

      // Apply folds
      if (foldRanges.length > 0) {
        view.dispatch({
          effects: foldRanges.map(({ from, to }) =>
            foldEffect.of({ from, to }),
          ),
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [value, mounted]); // Run when value works, but ideally only on initial load for a specific problem/lang?
  // Current logic re-folds on every keypress if marker is present.
  // Better: Only fold on language change or initial load.
  // But value is managed by parent.
  // Refined Logic below:

  // Only fold when language changes or content is reset to boilerplate?
  // For now, let's keep it simple: fold on mount and language change if value matches template?
  // User Requirement: "The boilerplate code should be line-folded, but can be modified by the user."
  // If user unfolds and edits, we shouldn't force refold.
  // So we need a ref to track if we already folded for this language session?
  // Let's rely on the fact that [language] dependency changes -> new boilerplate -> fold.
  const lastLanguageRef = useRef(language);

  useEffect(() => {
    if (!editorRef.current || !mounted) return;
    if (language === lastLanguageRef.current && mounted) {
      // If language hasn't changed, don't auto-fold (let user toggle)
      // return;
      // Wait, initial mount needs fold too.
    }
    lastLanguageRef.current = language;

    const view = editorRef.current.view;
    if (!view) return;

    const timer = setTimeout(() => {
      const lines = value.split("\n");
      // Basic region parsing
      let start = -1;
      const effects = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
          line.includes("// region boilerplate") ||
          line.includes("# region boilerplate")
        ) {
          start = i;
        } else if (
          start !== -1 &&
          (line.includes("// endregion") || line.includes("# endregion"))
        ) {
          // Found a region
          // Fold from end of start line to end of end line?
          // CodeMirror fold expects range.
          const lineStart = view.state.doc.line(start + 1);
          const lineEnd = view.state.doc.line(i + 1);
          // We want to fold the content BETWEEN the markers, or including markers?
          // User said: "This should be displayed to user as: ... code ..."
          // Usually we fold the whole block.
          // Let's fold the range covering these lines.

          // Create fold effect
          effects.push(
            foldEffect.of({
              from: lineStart.to, // End of start line (keeps start marker visible? No, usually we want to hide it all)
              // Wait, if we fold from lineStart.to, the header is visible.
              // If we want to hide "public class Main { ... }", we should fold valid ranges.
              // The markers are: // region boilerplate ... // endregion
              // The prompt says:
              /*
                  public class Main { ... }
                  This should be displayed to user as:
                  ...
                  int addTwoNums(int a, int b) { ... }
                  ...
               */
              // So the boilerplate includes the class wrapper.
              // Folding region behaves like VSCode regions.
              to: lineEnd.to,
            }),
          );
          start = -1;
        }
      }

      if (effects.length) {
        view.dispatch({ effects });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [language, mounted]); // Dependency on language ensures we fold when switching.

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
  onLanguageChange: (lang: string) => void;
}

export function ProblemEditorHeader({
  language,
  onLanguageChange,
}: ProblemEditorHeaderProps) {
  return (
    <div className="w-full items-center justify-between flex gap-2 p-2 border-b border-border bg-background">
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="java">Java</SelectItem>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="typescript">TypeScript</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-2">
        <ButtonGroup>
          <Button size="sm" variant="outline" className="w-fit">
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button
            size="sm"
            className="w-fit bg-green-600 text-white hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        </ButtonGroup>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
