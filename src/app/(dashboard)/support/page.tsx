import type { Metadata } from "next";
import ClientSupportPage from "@/components/layouts/support/support-page";

export const metadata: Metadata = {
  title: "BuildIT Support",
  description: "BuildIT Support Page",
};

export default function SupportPage() {
  return <ClientSupportPage />;
}
