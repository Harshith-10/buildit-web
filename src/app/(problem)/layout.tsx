import { SidebarProvider } from "@/components/ui/sidebar";

export default function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen">
      <SidebarProvider>{children}</SidebarProvider>
    </div>
  );
}
