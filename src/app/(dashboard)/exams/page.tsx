import { getExams } from "@/actions/exams-list";
import { ExamsView } from "../../../components/layouts/exams/exams-view";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const search = typeof params.q === "string" ? params.q : undefined;
  const status =
    typeof params.status === "string" &&
    ["upcoming", "ongoing", "completed"].includes(params.status)
      ? (params.status as "upcoming" | "ongoing" | "completed")
      : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const _view = typeof params.view === "string" ? params.view : undefined;

  const { data, total } = await getExams({
    page,
    search,
    status,
    sort,
    perPage: 10,
  });

  return <ExamsView data={data} total={total} />;
}
