import { getProblems } from "@/actions/problems-list";
import { CreateCollectionWorkspace } from "@/components/layouts/collections";
import { searchParamsCache } from "@/lib/search-params/problems";

export default async function CreateCollectionPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const {
        page,
        q: search,
        sort,
        type,
        difficulty,
    } = await searchParamsCache.parse(params);

    const { data, total } = await getProblems({
        page,
        search: search || undefined,
        type: type || undefined,
        difficulty: difficulty || undefined,
        sort: sort || undefined,
        perPage: 10,
    });

    return <CreateCollectionWorkspace data={data as any} total={total} />;
}
