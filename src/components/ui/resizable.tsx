"use client";

import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import type * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      {...props}
      // @ts-expect-error - direction prop exists on PanelGroup but types might be mismatched
      direction={props.orientation === "vertical" ? "vertical" : "horizontal"}
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={`bg-border z-10 flex items-center justify-center rounded-xs border ${orientation === "vertical" ? "h-4 w-3" : "h-3 w-4"}`}
        >
          {orientation === "vertical" ? (
            <GripVerticalIcon className="size-2.5" />
          ) : (
            <GripHorizontalIcon className="size-2.5" />
          )}
        </div>
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
