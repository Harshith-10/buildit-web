import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminDashboardData,
  getFacultyDashboardData,
  getStudentDashboardData,
} from "@/actions/dashboard";
import { AdminView } from "@/components/layouts/dashboard/admin-view";
import { FacultyView } from "@/components/layouts/dashboard/faculty-view";
import { StudentView } from "@/components/layouts/dashboard/student-view";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Dashboard | BuildIT",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const { user } = session;

  return (
    <main className="flex h-full w-full flex-col">
      {user.role === "student" && (
        <StudentDataWrapper userId={user.id} userName={user.name} />
      )}

      {user.role === "instructor" && <FacultyDataWrapper userId={user.id} />}

      {user.role === "admin" && <AdminDataWrapper />}
    </main>
  );
}

// Data Wrappers to keep the main component clean and handle async data fetching

async function StudentDataWrapper({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const data = await getStudentDashboardData(userId, userName);
  return <StudentView {...data} />;
}

async function FacultyDataWrapper({ userId }: { userId: string }) {
  const data = await getFacultyDashboardData(userId);
  return <FacultyView {...data} />;
}

async function AdminDataWrapper() {
  const data = await getAdminDashboardData();
  return <AdminView stats={data} />;
}
