import Link from "next/link";

import Logo from "@/components/common/logo";
import ThemeToggle from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="text-lg font-semibold tracking-tight">BuildIT</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#showcase" className="hover:text-foreground">
            Showcase
          </a>
          <a href="#companies" className="hover:text-foreground">
            Companies
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle variant="ghost" size="icon" />
          <Button asChild>
            <Link href="/auth">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
