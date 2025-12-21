"use client";

import { parseAsString, useQueryState } from "nuqs";
import UnderConstruction from "@/components/common/under-construction";
import { usePageName } from "@/hooks/use-page-name";

export default function CollectionsPage() {
  const [type] = useQueryState("type", parseAsString.withDefault("none"));
  usePageName(
    type === "private"
      ? "Your Collections"
      : type === "practice"
        ? "Practice Sheets"
        : type === "company"
          ? "Company Lists"
          : "Collections",
  );

  return <UnderConstruction />;
}
