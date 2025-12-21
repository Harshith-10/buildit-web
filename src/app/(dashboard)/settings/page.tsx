"use client";

import { usePageName } from "@/hooks/use-page-name";

export default function SettingsPage() {
  usePageName("Settings");

  return <div>Settings Page</div>;
}
