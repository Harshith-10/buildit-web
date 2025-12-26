import { getCollections } from "@/actions/collections-list";
import { CollectionsView } from "@/components/layouts/collections/collections-view";
import { searchParamsCache } from "@/lib/search-params/collections";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const {
    page,
    q: search,
    sort,
    visibility,
  } = await searchParamsCache.parse(searchParams);

  const { data, total } = await getCollections({
    page,
    search: search || undefined,
    sort: sort || undefined,
    visibility: visibility || undefined,
    perPage: 10,
  });

  return <CollectionsView data={data} total={total} />;
}
