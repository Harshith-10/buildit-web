import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen">
      <SidebarProvider>
        {children}
        <Toaster richColors />
      </SidebarProvider>
    </div>
  );
}
