"use client";

import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { McqOption } from "../create-problem-client";

interface McqOptionsPanelProps {
  options: McqOption[];
  setOptions: (options: McqOption[]) => void;
  isMulti: boolean;
  setIsMulti: (isMulti: boolean) => void;
}

export default function McqOptionsPanel({
  options,
  setOptions,
  isMulti,
  setIsMulti,
}: McqOptionsPanelProps) {
  const addOption = () => {
    const newOption: McqOption = {
      id: Math.random().toString(36).substring(7),
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id: string, updates: Partial<McqOption>) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, ...updates } : opt)),
    );
  };

  const removeOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleSingleSelect = (id: string) => {
    // For single selection, uncheck all others
    setOptions(
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      })),
    );
  };

  // When switching from multi to single, keep only first correct answer
  const handleModeChange = (newIsMulti: boolean) => {
    if (!newIsMulti) {
      // Switching to single: keep only the first correct one
      let foundFirst = false;
      setOptions(
        options.map((opt) => {
          if (opt.isCorrect && !foundFirst) {
            foundFirst = true;
            return opt;
          }
          return { ...opt, isCorrect: false };
        }),
      );
    }
    setIsMulti(newIsMulti);
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4 bg-background">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-semibold text-sm">Answer Options</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="multi-switch"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Multiple Correct
            </Label>
            <Switch
              id="multi-switch"
              checked={isMulti}
              onCheckedChange={handleModeChange}
            />
          </div>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {options.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No options added. Click "Add Option" to start.
          </div>
        ) : (
          options.map((option, index) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                option.isCorrect
                  ? "border-green-500 bg-green-500/10"
                  : "border-border",
              )}
            >
              <span className="text-muted-foreground font-medium w-6">
                {String.fromCharCode(65 + index)}.
              </span>

              {isMulti ? (
                <Checkbox
                  checked={option.isCorrect}
                  onCheckedChange={(checked) =>
                    updateOption(option.id, { isCorrect: !!checked })
                  }
                />
              ) : (
                <RadioGroup
                  value={options.find((o) => o.isCorrect)?.id || ""}
                  onValueChange={handleSingleSelect}
                >
                  <RadioGroupItem value={option.id} />
                </RadioGroup>
              )}

              <Input
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option.text}
                onChange={(e) =>
                  updateOption(option.id, { text: e.target.value })
                }
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeOption(option.id)}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {options.length > 0 && (
        <div className="text-xs text-muted-foreground border-t pt-2">
          {isMulti
            ? "Check all correct answers"
            : "Select the single correct answer"}
        </div>
      )}
    </div>
  );
}
