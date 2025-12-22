"use client";

import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoleSpecificSettings() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const role = session?.user?.role;

  if (!role) return null;

  return (
    <div className="space-y-6">
      {role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Student Preferences</CardTitle>
            <CardDescription>Manage your learning experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Student specific settings will go here (e.g., default coding
              language, notification preferences).
            </p>
          </CardContent>
        </Card>
      )}

      {role === "instructor" && (
        <Card>
          <CardHeader>
            <CardTitle>Instructor Tools</CardTitle>
            <CardDescription>
              Configure your teaching environment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instructor specific settings will go here (e.g., default grading
              templates, classroom visibility).
            </p>
          </CardContent>
        </Card>
      )}

      {role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Global settings for the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Admin specific settings will go here (e.g., user management
              policies, maintenance mode).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
