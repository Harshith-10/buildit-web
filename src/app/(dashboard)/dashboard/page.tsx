"use client";

import UnderConstruction from "@/components/common/under-construction";
import { usePageName } from "@/hooks/use-page-name";

export default function DashboardPage() {
  usePageName("Dashboard");

  return (
    <main className="h-full w-full">
      <UnderConstruction />
    </main>
  );
}
