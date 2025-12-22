import { useEffect, useState } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
}: CodeEditorProps) {
  const [lines, setLines] = useState(1);

  useEffect(() => {
    setLines(value.split("\n").length || 1);
  }, [value]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm relative overflow-hidden border border-[#333]">
      <div className="flex-none bg-[#252526] px-4 py-2 text-xs text-[#cccccc] border-b border-[#333] flex justify-between items-center">
        <span>{language}</span>
      </div>
      <div className="flex-1 flex relative overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-none w-12 bg-[#1e1e1e] text-[#858585] text-right pr-3 pt-2 select-none leading-6 border-r border-[#333]">
          {Array.from({ length: Math.max(lines, 1) }).map((_, i) => (
            <div key={i.toString()}>{i + 1}</div>
          ))}
        </div>

        {/* Editor Area */}
        <textarea
          className="flex-1 bg-transparent border-none resize-none outline-none p-2 leading-6 text-[#d4d4d4] whitespace-pre font-mono"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setLines(e.target.value.split("\n").length);
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
