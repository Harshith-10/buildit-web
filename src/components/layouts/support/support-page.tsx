"use client";

import { usePageName } from "@/hooks/use-page-name";
import UnderConstruction from "../../common/under-construction";

export default function ClientSupportPage() {
  usePageName("BuildIT Support");

  return <UnderConstruction />;
}
