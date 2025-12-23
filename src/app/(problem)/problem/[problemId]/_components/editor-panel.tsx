"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { go } from "@codemirror/lang-go";
import { php } from "@codemirror/lang-php";
import { sql } from "@codemirror/lang-sql";
import { githubDark } from "@uiw/codemirror-theme-github";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code2, RotateCcw, Settings2 } from "lucide-react";

interface CodeEditorPanelProps {
  language: string;
  setLanguage: (lang: string) => void;
  code: string;
  setCode: (code: string) => void;
}

export function CodeEditorPanel({
  language,
  setLanguage,
  code,
  setCode,
}: CodeEditorPanelProps) {
  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "cpp":
        return cpp();
      case "java":
        return java();
      case "python":
        return python();
      case "javascript":
      case "typescript":
        return javascript({ typescript: true });
      case "rust":
        return rust();
      case "go":
        return go();
      case "php":
        return php();
      case "sql":
        return sql();
      default:
        return cpp();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Toolbar */}
      <div className="h-12 flex items-center justify-between px-4 bg-muted/20 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Code
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-background/50 border-border/50 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setCode("// Resetting code...")}
            title="Reset Code"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Editor Settings"
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Code Mirror Instance */}
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[getLanguageExtension(language)]}
          onChange={(val) => setCode(val)}
          theme={githubDark}
          className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
