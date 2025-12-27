import { getLanguages } from "@/actions/code-execution";
import CreateProblemClient from "@/components/layouts/create-problem/create-problem-client";

export default async function CreateProblemPage() {
  const languages = await getLanguages();

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <CreateProblemClient languages={languages} />
    </div>
  );
}
