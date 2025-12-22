import { getProblems } from "@/actions/problems-list";
import { ProblemsView } from "@/components/layouts/problems/problems-view";

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const search = typeof params.q === "string" ? params.q : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const type =
    typeof params.type === "string"
      ? (params.type as
          | "coding"
          | "mcq_single"
          | "mcq_multi"
          | "true_false"
          | "descriptive")
      : undefined;
  const difficulty =
    typeof params.difficulty === "string"
      ? (params.difficulty as "easy" | "medium" | "hard")
      : undefined;

  const { data, total } = await getProblems({
    page,
    search,
    type,
    difficulty,
    sort,
    perPage: 10,
  });

  return <ProblemsView data={data} total={total} />;
}
