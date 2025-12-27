"use client";

import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageName } from "@/lib/utils/languages";

// --- Header Sub-Component ---

interface EditorHeaderProps {
  language: string;
  version: string;
  languages: Runtime[];
  isExecuting: boolean;
  onLanguageChange: (lang: string) => void;
  onVersionChange: (ver: string) => void;
  onRun: () => void;
  onSubmit: () => void; // "Run TestCases" logic essentially
}

function EditorHeader({
  language,
  version,
  languages,
  isExecuting,
  onLanguageChange,
  onVersionChange,
  onRun,
  onSubmit,
}: EditorHeaderProps) {
  // Computed unique languages
  const uniqueLanguages = useMemo(() => {
    const set = new Set(languages.map((l) => l.language));
    // ensure default ones exist if list is empty?
    if (set.size === 0) {
      set.add("java");
      set.add("python");
      set.add("javascript");
    }
    return Array.from(set).sort();
  }, [languages]);

  // Computed versions for selected language
  const versions = useMemo(() => {
    return languages
      .filter((l) => l.language === language)
      .map((l) => l.version)
      .sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" }),
      ); // Descending
  }, [languages, language]);

  return (
    <div className="flex h-12 w-full items-center justify-between border-b bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {uniqueLanguages.map((l) => (
              <SelectItem key={l} value={l}>
                {getLanguageName(l)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={version}
          onValueChange={onVersionChange}
          disabled={versions.length === 0}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="Version" />
          </SelectTrigger>
          <SelectContent>
            {versions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={onRun}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <Loader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Run Code
        </Button>
        {/* We might remove Submit from here if it's "Submit Exam" at top. 
            Usually this "Submit" means "Run against all hidden testcases". 
            Let's call it "Final Test" or "Submit Solution" to distinguish from "End Exam". 
            But based on previous code, "Submit" button was on Editor. 
            However, user wants "Refactor duplicate ... callbacks". 
            We'll stick to "Run" (Sample) vs "Submit" (Hidden) if the platform supports it. 
            For now, let's keep Run.
        */}
      </div>
    </div>
  );
}

// --- Main Component ---

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  languages: Runtime[];
  initialLanguage?: string;
  onRun: (code: string, language: string, version: string) => Promise<void>;
  isExecuting: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  languages,
  initialLanguage = "java",
  onRun,
  isExecuting,
}: CodeEditorProps) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState(initialLanguage);
  const [version, setVersion] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update version when language changes
  useEffect(() => {
    const langVersions = languages.filter((l) => l.language === language);
    if (langVersions.length > 0) {
      // Sort desc
      langVersions.sort((a, b) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }),
      );
      setVersion(langVersions[0].version);
    }
  }, [language, languages]);

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

  const handleRun = () => {
    onRun(value, language, version);
  };

  if (!mounted) return <div className="flex-1 bg-muted/10 animate-pulse" />;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background border-r">
      <EditorHeader
        language={language}
        version={version}
        languages={languages}
        isExecuting={isExecuting}
        onLanguageChange={setLanguage}
        onVersionChange={setVersion}
        onRun={handleRun}
        onSubmit={() => {}} // Placeholder
      />
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={value}
          height="100%"
          extensions={extensions}
          onChange={onChange}
          theme={theme === "light" ? duotoneLight : duotoneDark}
          className="text-base h-full"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
