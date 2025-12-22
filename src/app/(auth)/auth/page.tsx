"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/auth-form";
import { usePageName } from "@/hooks/use-page-name";

function AuthContent() {
  return <AuthForm />;
}

export default function LoginPage() {
  usePageName("Login");

  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
