"use client";

import { javascript } from "@codemirror/lang-javascript";
import { duotoneDark, duotoneLight } from "@uiw/codemirror-theme-duotone";
import CodeMirror from "@uiw/react-codemirror";
import { Play, Send, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProblemEditor() {
  const { theme } = useTheme();
  // Ensure we mount only after hydration to prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  const [_value, setValue] = React.useState("console.log('Hello, World!');");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const onChange = React.useCallback((val: string) => {
    setValue(val);
  }, []);

  if (!mounted) return null; // Prevent hydration errors with themes

  return (
    <div className="flex-1 flex w-full overflow-hidden bg-background">
      <CodeMirror
        className="flex-1 text-base"
        value={_value}
        height="100%"
        extensions={[javascript({ jsx: true })]}
        onChange={onChange}
        // Switch between your custom themes
        theme={theme === "light" ? duotoneLight : duotoneDark}
        // Basic setup to ensure clean rendering
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

export function ProblemEditorHeader() {
  return (
    <div className="w-full items-center justify-between flex gap-2 p-2 border-b border-border bg-background">
      <Select>
        <SelectTrigger className="min-w-[180px]">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="python">Python</SelectItem>
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
