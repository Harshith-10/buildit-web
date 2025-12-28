import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSubmissions } from "@/actions/submissions-list";
import { SubmissionsView } from "@/components/layouts/submissions/submissions-view";
import { auth } from "@/lib/auth";
import { searchParamsCache } from "@/lib/search-params/submissions";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  // Check if user is admin or instructor
  if (session.user.role !== "admin" && session.user.role !== "instructor") {
    redirect("/dashboard");
  }

  const {
    page,
    q: search,
    sort,
    status,
  } = await searchParamsCache.parse(searchParams);

  const { data, total } = await getSubmissions({
    page,
    search: search || undefined,
    status: status || undefined,
    sort: sort || undefined,
    perPage: 10,
  });

  return <SubmissionsView data={data} total={total} />;
}
