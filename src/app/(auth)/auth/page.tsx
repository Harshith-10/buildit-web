"use client";

import AuthForm from "@/components/auth/auth-form";
import { usePageName } from "@/hooks/use-page-name";

export default function LoginPage() {
  usePageName("Login");

  return <AuthForm />;
}
