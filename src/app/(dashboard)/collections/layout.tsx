import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function CollectionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth");
    }

    // Access restricted to instructors only as per user request
    if (session.user.role !== "instructor") {
        redirect("/dashboard");
    }

    return <>{children}</>;
}
