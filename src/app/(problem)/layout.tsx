import { getProblems } from "@/actions/problem-data";
import { ProblemSidebar } from "@/components/layouts/problem/problem-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function ProblemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const problems = await getProblems();

  return (
    <div className="h-screen w-screen bg-sidebar">
      <SidebarProvider defaultOpen={true}>
        <ProblemSidebar problems={problems} />
        <SidebarInset className="h-full overflow-hidden">
          {children}
        </SidebarInset>
        <Toaster richColors />
      </SidebarProvider>
    </div>
  );
}
