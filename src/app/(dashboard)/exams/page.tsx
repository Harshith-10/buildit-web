import { getExamSession } from "@/actions/exam-session";
import { getExams } from "@/actions/exams-list";
import { searchParamsCache } from "@/lib/search-params/exams";
import { ExamsView } from "../../../components/layouts/exams/exams-view";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    page,
    q: search,
    status,
    sort,
    error,
    sessionId,
  } = await searchParamsCache.parse(searchParams);

  let terminationDetails = null;
  if (sessionId && error === "exam_terminated") {
    const session = await getExamSession(sessionId);
    if (session?.terminationDetails) {
      terminationDetails = session.terminationDetails;
    }
  }

  const { data, total } = await getExams({
    page,
    search: search || undefined, // nuqs returns "" by default, getExams expects string | undefined
    status: status || undefined,
    sort: sort || undefined, // getExams handles default sort logic, but we can pass it explicitly
    perPage: 10,
  });

  return (
    <ExamsView
      data={data}
      total={total}
      error={error}
      terminationDetails={terminationDetails}
    />
  );
}
