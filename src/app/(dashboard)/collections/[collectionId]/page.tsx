"use client";

import { usePageName } from "@/hooks/use-page-name";

export default function CollectionPage() {
  usePageName("Collection Name");

  return <div>Collection Page</div>;
}
