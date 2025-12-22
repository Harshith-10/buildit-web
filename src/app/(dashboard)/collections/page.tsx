import { getCollections } from "@/actions/collections-list";
import { CollectionsView } from "@/components/layouts/collections/collections-view";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const search = typeof params.q === "string" ? params.q : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const visibility =
    typeof params.visibility === "string"
      ? (params.visibility as "public" | "private")
      : undefined;

  const { data, total } = await getCollections({
    page,
    search,
    sort,
    visibility,
    perPage: 10,
  });

  return <CollectionsView data={data} total={total} />;
}
