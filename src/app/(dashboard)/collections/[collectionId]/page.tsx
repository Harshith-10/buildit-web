import { notFound } from "next/navigation";
import { getCollection } from "@/actions/collections-list";
import { CollectionDetailsView } from "@/components/layouts/collections";
import { searchParamsCache } from "@/lib/search-params/problems";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ collectionId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collectionId } = await params;
  const sParams = await searchParams;

  const {
    page,
    q: search,
    sort,
    type,
    difficulty,
  } = await searchParamsCache.parse(sParams);

  const collection = await getCollection(collectionId, {
    page,
    search: search || undefined,
    type: type || undefined,
    difficulty: difficulty || undefined,
    sort: sort || undefined,
  });

  if (!collection) {
    notFound();
  }

  return <CollectionDetailsView collection={collection as any} />;
}
