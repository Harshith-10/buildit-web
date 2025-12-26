import { getProblems } from "@/actions/problems-list";
import { ProblemsView } from "@/components/layouts/problems/problems-view";
import { searchParamsCache } from "@/lib/search-params/problems";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    page,
    q: search,
    sort,
    type,
    difficulty,
  } = await searchParamsCache.parse(searchParams);

  const { data, total } = await getProblems({
    page,
    search: search || undefined,
    type: type || undefined,
    difficulty: difficulty || undefined,
    sort: sort || undefined,
    perPage: 10,
  });

  return <ProblemsView data={data} total={total} />;
}
