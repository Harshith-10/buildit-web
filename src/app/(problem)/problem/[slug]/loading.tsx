import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="h-14 border-b px-4 flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[40%] border-r p-4 space-y-4">
          <Skeleton className="h-8 w-[80%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[60%]" />
          <div className="space-y-2 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="w-[60%] flex flex-col">
          <div className="h-[60%] border-b p-4">
            <Skeleton className="h-FULL w-full rounded-md" />
          </div>
          <div className="h-[40%] p-4">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
