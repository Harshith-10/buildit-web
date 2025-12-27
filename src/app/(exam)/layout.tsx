import { SidebarProvider } from "@/components/ui/sidebar";

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full overflow-hidden">
      <SidebarProvider className="h-full overflow-hidden">
        {children}
      </SidebarProvider>
    </div>
  );
}
