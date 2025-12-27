import { getCollections } from "@/actions/collections-list";
import { getProblems } from "@/actions/problems-list";
import CreateExamClient from "@/components/layouts/create-exam/create-exam-client";

export default async function CreateExamPage() {
    // Fetch collections and problems for the exam creation form
    const [collectionsResult, problemsResult] = await Promise.all([
        getCollections({ perPage: 100 }),
        getProblems({ perPage: 200 }),
    ]);

    return (
        <CreateExamClient
            collections={collectionsResult.data}
            problems={problemsResult.data}
        />
    );
}
