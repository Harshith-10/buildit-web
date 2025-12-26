import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreateProblemForm } from "@/components/layouts/problems/create-problem-form";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Create Problem | BuildIT",
};

export default async function CreateProblemPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  // Only allow instructors and admins to create problems
  if (session.user.role === "student") {
    redirect("/problems");
  }

  return (
    <main className="flex h-full w-full flex-col">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Problem</h1>
          <p className="text-muted-foreground mt-2">
            Add a new problem to the platform
          </p>
        </div>
        <CreateProblemForm />
      </div>
    </main>
  );
}
